import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Workspace } from '../entities/workspace.entity';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspacesRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMembersRepository: Repository<WorkspaceMember>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private readonly logger = new Logger(WorkspacesService.name);

  async create(createWorkspaceDto: CreateWorkspaceDto, userId: string) {
    const workspace = this.workspacesRepository.create({
      name: createWorkspaceDto.name,
      ownerId: userId,
      logo: createWorkspaceDto.logo || null,
    });
    
    await this.workspacesRepository.save(workspace);
    
    // Add owner as a member with OWNER role
    const ownerMembership = this.workspaceMembersRepository.create({
      userId,
      workspaceId: workspace.id,
      role: 'OWNER',
    });
    await this.workspaceMembersRepository.save(ownerMembership);
    
    return this.findOneWithMembers(workspace.id, userId);
  }

  async findAll() {
    return this.workspacesRepository.find({
      relations: ['owner'],
    });
  }

  async findMyWorkspaces(userId: string) {
    // Find workspaces where user is owner
    const ownedWorkspaces = await this.workspacesRepository.find({
      where: { ownerId: userId },
      relations: ['owner'],
    });

    // Find workspaces where user is a member
    const memberships = await this.workspaceMembersRepository.find({
      where: { userId },
      relations: ['workspace', 'workspace.owner'],
    });

    const memberWorkspaces = memberships.map(m => m.workspace);

    // Combine and deduplicate
    const allWorkspaces = [...ownedWorkspaces, ...memberWorkspaces];
    const uniqueWorkspaces = allWorkspaces.filter((workspace, index, self) =>
      index === self.findIndex(w => w.id === workspace.id)
    );

    // Get user's last workspace
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['lastWorkspaceId'],
    });

    // Return workspaces with last workspace info
    return {
      workspaces: uniqueWorkspaces,
      lastWorkspaceId: user?.lastWorkspaceId,
    };
  }

  async findOne(id: string, userId: string) {
    // Check if user is owner or member
    const workspace = await this.workspacesRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
      const membership = await this.workspaceMembersRepository.findOne({
        where: { workspaceId: id, userId },
      });
      if (!membership) {
        throw new ForbiddenException('Access denied');
      }
    }

    // Update user's last workspace
    await this.updateLastWorkspace(userId, id);

    return workspace;
  }

  async findOneWithMembers(id: string, userId: string) {
    const workspace = await this.workspacesRepository.findOne({
      where: { id },
      relations: ['owner', 'members', 'members.user'],
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
      const membership = await this.workspaceMembersRepository.findOne({
        where: { workspaceId: id, userId },
      });
      if (!membership) {
        throw new ForbiddenException('Access denied');
      }
    }

    // Update user's last workspace
    await this.updateLastWorkspace(userId, id);

    return workspace;
  }

  async getWorkspaceMembers(workspaceId: string, userId: string) {
    // Verify user has access to this workspace
    await this.findOne(workspaceId, userId);

    const members = await this.workspaceMembersRepository.find({
      where: { workspaceId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    return members;
  }

  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto, userId: string) {
    const workspace = await this.findOne(id, userId);

    // Only owners can update workspace
    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('Only workspace owners can update workspace');
    }

    await this.workspacesRepository.update(id, updateWorkspaceDto);
    return this.findOneWithMembers(id, userId);
  }

  async remove(id: string, userId: string) {
    const workspace = await this.findOne(id, userId);

    // Only owners can delete workspace
    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('Only workspace owners can delete workspace');
    }

    await this.workspacesRepository.delete(id);
    return { message: 'Workspace deleted successfully' };
  }

  async leaveWorkspace(workspaceId: string, userId: string) {
    const workspace = await this.findOne(workspaceId, userId);

    // Owners cannot leave their own workspace (they must transfer ownership or delete)
    if (workspace.ownerId === userId) {
      throw new ForbiddenException('Workspace owners cannot leave their own workspace');
    }

    await this.workspaceMembersRepository.delete({
      workspaceId,
      userId,
    });

    return { message: 'Left workspace successfully' };
  }

  private async updateLastWorkspace(userId: string, workspaceId: string) {
    await this.usersRepository.update(userId, {
      lastWorkspaceId: workspaceId,
    });
  }

  async getLastWorkspace(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['lastWorkspaceId'],
    });

    if (!user?.lastWorkspaceId) {
      return null;
    }

    // Verify user still has access to this workspace
    try {
      return await this.findOne(user.lastWorkspaceId, userId);
    } catch (error) {
      // If user no longer has access, clear the last workspace
      await this.usersRepository.update(userId, { lastWorkspaceId: null });
      return null;
    }
  }

  async updateWorkspaceLogo(workspaceId: string, userId: string, logo: string) {
    // Verify user is owner
    const workspace = await this.findOne(workspaceId, userId);
    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('Only workspace owners can update workspace logo');
    }

    // Update workspace with new logo URL/ID
    await this.workspacesRepository.update(workspaceId, { logo });
    
    this.logger.log(`Workspace logo updated: ${logo} for workspace: ${workspace.name}`);
    
    return this.findOneWithMembers(workspaceId, userId);
  }

  async removeWorkspaceLogo(workspaceId: string, userId: string) {
    // Verify user is owner
    const workspace = await this.findOne(workspaceId, userId);
    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('Only workspace owners can remove workspace logo');
    }
    
    // Update workspace to remove logo
    await this.workspacesRepository.update(workspaceId, { logo: null });
    
    return { message: 'Workspace logo removed successfully' };
  }
}

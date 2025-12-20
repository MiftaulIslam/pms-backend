import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  @ApiResponse({ status: 201, description: 'Workspace created successfully' })
  create(@Body() createWorkspaceDto: CreateWorkspaceDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.workspacesService.create(createWorkspaceDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workspaces (admin only)' })
  @ApiResponse({ status: 200, description: 'All workspaces retrieved' })
  findAll() {
    return this.workspacesService.findAll();
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my workspaces (owned and member of)' })
  @ApiResponse({ status: 200, description: 'My workspaces retrieved' })
  findMyWorkspaces(@Req() req: any) {
    const userId = req.user?.id;
    return this.workspacesService.findMyWorkspaces(userId);
  }

  @Get('last')
  @ApiOperation({ summary: 'Get user\'s last active workspace' })
  @ApiResponse({ status: 200, description: 'Last workspace retrieved' })
  @ApiResponse({ status: 404, description: 'No last workspace found' })
  getLastWorkspace(@Req() req: any) {
    const userId = req.user?.id;
    return this.workspacesService.getLastWorkspace(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace by ID' })
  @ApiResponse({ status: 200, description: 'Workspace retrieved' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.workspacesService.findOne(id, userId);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get all members of a workspace' })
  @ApiResponse({ status: 200, description: 'Workspace members retrieved' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  getWorkspaceMembers(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.workspacesService.getWorkspaceMembers(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workspace (owner only)' })
  @ApiResponse({ status: 200, description: 'Workspace updated successfully' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({ status: 403, description: 'Access denied or not owner' })
  update(@Param('id') id: string, @Body() updateWorkspaceDto: UpdateWorkspaceDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.workspacesService.update(id, updateWorkspaceDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete workspace (owner only)' })
  @ApiResponse({ status: 204, description: 'Workspace deleted successfully' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({ status: 403, description: 'Access denied or not owner' })
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.workspacesService.remove(id, userId);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Leave workspace (members only, not owner)' })
  @ApiResponse({ status: 200, description: 'Left workspace successfully' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({ status: 403, description: 'Access denied or cannot leave own workspace' })
  leaveWorkspace(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.workspacesService.leaveWorkspace(id, userId);
  }

  @Patch(':id/logo')
  @ApiOperation({ summary: 'Update workspace logo (owner only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: { type: 'string', description: 'Workspace logo URL or image ID' },
      },
      required: ['logo'],
    },
  })
  @ApiResponse({ status: 200, description: 'Workspace logo updated successfully' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({ status: 403, description: 'Access denied or not owner' })
  updateWorkspaceLogo(
    @Param('id') id: string, 
    @Body() body: { logo: string },
    @Req() req: any
  ) {
    const userId = req.user?.id;
    return this.workspacesService.updateWorkspaceLogo(id, userId, body.logo);
  }

  @Delete(':id/logo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove workspace logo (owner only)' })
  @ApiResponse({ status: 200, description: 'Workspace logo removed successfully' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({ status: 403, description: 'Access denied or not owner' })
  removeWorkspaceLogo(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.workspacesService.removeWorkspaceLogo(id, userId);
  }
}

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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'My Team Workspace' },
        logo: { type: 'string', format: 'binary', description: 'Workspace logo (optional)' },
      },
      required: ['name'],
    },
  })
  @ApiResponse({ status: 201, description: 'Workspace created successfully' })
  @UseInterceptors(FileInterceptor('logo'))
  create(@Body() createWorkspaceDto: CreateWorkspaceDto, @Req() req: any, @UploadedFile() file?: Express.Multer.File) {
    const userId = req.user?.id;
    return this.workspacesService.create(createWorkspaceDto, userId, file);
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

  @Post(':id/logo')
  @ApiOperation({ summary: 'Update workspace logo (owner only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: { type: 'string', format: 'binary', description: 'Workspace logo' },
      },
      required: ['logo'],
    },
  })
  @ApiResponse({ status: 200, description: 'Workspace logo updated successfully' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({ status: 403, description: 'Access denied or not owner' })
  @UseInterceptors(FileInterceptor('logo'))
  updateWorkspaceLogo(
    @Param('id') id: string, 
    @Req() req: any, 
    @UploadedFile() file: Express.Multer.File
  ) {
    const userId = req.user?.id;
    return this.workspacesService.updateWorkspaceLogo(id, userId, file);
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

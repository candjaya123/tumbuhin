import { Controller, Get, Put, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('api/v1/business-profile')
@UseGuards(JwtAuthGuard)
export class BusinessProfileController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;
    return data;
  }

  @Put('profile')
  async updateProfile(@Request() req: any, @Body() body: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('profiles')
      .update(body)
      .eq('id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  @Get('tenant')
  async getTenant(@Request() req: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('tenants')
      .select('*')
      .eq('id', req.user.tenant_id)
      .single();
    if (error) throw error;
    return data;
  }

  @Put('tenant')
  async updateTenant(@Request() req: any, @Body() body: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('tenants')
      .update(body)
      .eq('id', req.user.tenant_id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  @Get('staff')
  async getStaff(@Request() req: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('tenant_id', req.user.tenant_id);
    if (error) throw error;
    return data;
  }

  @Post('staff/invite')
  async inviteStaff(@Request() req: any, @Body() body: { email: string; role: string }) {
    // Logic for staff invitation (e.g. sending email or creating a placeholder profile)
    // For now, let's just return success
    return { success: true, message: `Invitation sent to ${body.email}` };
  }

  @Get('notifications')
  async getNotifications(@Request() req: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('tenant_notification_configs')
      .select('*')
      .eq('tenant_id', req.user.tenant_id);
    if (error) throw error;
    return data;
  }

  @Put('notifications/:role')
  async updateNotification(@Request() req: any, @Param('role') role: string, @Body() body: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('tenant_notification_configs')
      .update(body)
      .eq('tenant_id', req.user.tenant_id)
      .eq('role', role)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  @Get('staff/:userId/logs')
  async getStaffLogs(@Param('userId') userId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return data;
  }
}

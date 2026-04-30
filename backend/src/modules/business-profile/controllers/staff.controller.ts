import { Controller, Get, Post, Body, Request, UseGuards, Param, Delete } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles, UserRole } from '../../../core/auth/role.decorator';

@Controller('api/v1/staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  async getStaff(@Request() req: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('staff_accounts')
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .eq('tenant_id', req.user.tenant_id);
    
    if (error) throw error;
    return data;
  }

  @Post()
  @Roles(UserRole.OWNER)
  async createStaff(@Request() req: any, @Body() payload: any) {
    const client = this.supabaseService.getClient();
    
    // 1. Create Profile / Link existing profile if possible
    // Untuk simplifikasi, kita asumsikan profile_id sudah ada atau dibuat via auth
    
    const { data, error } = await client
      .from('staff_accounts')
      .insert({
        tenant_id: req.user.tenant_id,
        profile_id: payload.profile_id,
        role: payload.role || 'cashier',
        pin: payload.pin,
        is_active: true
      })
      .select()
      .single();
    
    if (error) throw error;

    // Update role di tabel profiles juga
    await client
      .from('profiles')
      .update({ role: payload.role || 'cashier' })
      .eq('id', payload.profile_id);

    return data;
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  async deleteStaff(@Param('id') id: string, @Request() req: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('staff_accounts')
      .delete()
      .eq('id', id)
      .eq('tenant_id', req.user.tenant_id);
    
    if (error) throw error;
    return { success: true };
  }
}

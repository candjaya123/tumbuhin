import { Controller, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('tenants')
  async getTenants(@Request() req: any) {
    // Check if user is super_admin (logic to be implemented or rely on role in JWT)
    if (req.user.role !== 'super_admin') {
      throw new Error('Unauthorized: Super Admin access only');
    }

    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('tenants')
      .select(`
        *,
        profiles:profiles(count)
      `);
    
    if (error) throw error;
    return data;
  }

  @Put('tenants/:id')
  async updateTenant(@Param('id') id: string, @Body() body: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('tenants')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

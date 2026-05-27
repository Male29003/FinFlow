using System;
using Application.Interface;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DataAccess.Configuration;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    public DbSet<User> Users { get; set; }
    public DbSet<GiaoDich> GiaoDich { get; set; }
    //public DbSet<ChiTietGiaoDich> ChiTietGiaoDich { get; set; }
    public DbSet<TaiKhoan> TaiKhoan { get; set; }
    public DbSet<LoaiTaiKhoan> LoaiTaiKhoan { get; set; }
    public DbSet<TheLoai> TheLoai { get; set; }
    public DbSet<Token> Tokens { get; set; }
    public DbSet<LienKetNganHang> LienKetNganHangs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Chặn xóa dây chuyền ở Tài Khoản Gốc
        modelBuilder.Entity<GiaoDich>()
            .HasOne(g => g.TaiKhoanGoc)
            .WithMany()
            .HasForeignKey(g => g.TaiKhoanGocId)
            .OnDelete(DeleteBehavior.Restrict);
        // Chặn xóa dây chuyền ở Tài Khoản phụ
        modelBuilder.Entity<GiaoDich>()
            .HasOne(g => g.TaiKhoanPhu)
            .WithMany()
            .HasForeignKey(g => g.TaiKhoanPhuId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<BaseEntity>();

        foreach(var entry in entries)
        {
            if(entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
            } else if(entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
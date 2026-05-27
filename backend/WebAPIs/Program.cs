using Application.Services;
using DataAccess;
using DataAccess.Configuration;
using Domain.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.Tasks;

namespace WebAPIs
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var host = CreateHostBuilder(args).Build();
            using (var scope = host.Services.CreateScope())
            {
                var logger = scope.ServiceProvider
                    .GetRequiredService<ILogger<Program>>();
                try
                {
                    var db = scope.ServiceProvider
                        .GetRequiredService<ApplicationDbContext>();
                    await db.Database.MigrateAsync();
                    await SeedData.SeedAsync(db);
                    logger.LogInformation("✅ Database seeded successfully.");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "❌ Seed failed: {Message}", ex.Message);
                }
            }
            host.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();

                    webBuilder.ConfigureServices((context, services) =>
                    {
                        // Cấu hình dịch vụ controllers
                        services.AddControllers();

                        // Cấu hình dịch vụ cho UserService
                        services.AddScoped<IUserService, UserService>();
                        services.AddScoped<ITokenService, TokenService>();

                        services.AddMemoryCache();
                    });
                });
    }
}

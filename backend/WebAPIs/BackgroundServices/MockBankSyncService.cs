using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace WebAPIs.BackgroundServices
{
    public class MockBankSyncService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<MockBankSyncService> _logger;

        public MockBankSyncService(IServiceProvider serviceProvider, ILogger<MockBankSyncService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("MockBankSyncService đã khởi động!");

            // Cứ mỗi 30 giây nó chạy một lần
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await DoWork();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi đồng bộ ngân hàng giả lập!");
                }

                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }

        private async Task DoWork()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                // Ở đây ông có thể lấy DB Context để chèn giao dịch ảo vào
                // var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                _logger.LogInformation($"[Sync] Đang đồng bộ giao dịch vào {DateTime.Now:HH:mm:ss}...");

                // Code giả lập chèn dữ liệu vào DB ở đây
                await Task.CompletedTask;
            }
        }
    }
}
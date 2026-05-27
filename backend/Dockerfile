# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy toàn bộ source code vào
COPY . .

# Restore và Publish project WebAPIs
RUN dotnet restore "WebAPIs/WebAPIs.csproj"
RUN dotnet publish "WebAPIs/WebAPIs.csproj" -c Release -o /app/publish

# Run Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Expose port cho Render (Render mặc định dùng port 8080 hoặc 10000)
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "WebAPIs.dll"]
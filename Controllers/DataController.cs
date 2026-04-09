using CWNS.BackEnd.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CWNS.BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DataController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DataController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("history")]
        [Authorize]
        public async Task<IActionResult> GetHistory()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var logs = await _context.ReputationLogs
                .Where(l => l.UserId == userId)
                .OrderByDescending(l => l.Timestamp)
                .Take(50)
                .ToListAsync();

            return Ok(logs);
        }

        [HttpGet("rankings")]
        public async Task<IActionResult> GetRankings()
        {
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var url = $"https://ninjasaga.cc/data/clan_rankings.json?t={timestamp}";
            
            try 
            {
                using var client = new HttpClient();
                var response = await client.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    // We can deserialize and reserialize, or simply return the JSON directly with ContentResult
                    return Content(content, "application/json"); 
                }
            } 
            catch (Exception ex)
            {
                // Fallback in case of failure
                Console.WriteLine("API Fetch Failed: " + ex.Message);
            }

            return BadRequest(new { error = "No se pudo recuperar la información de Ninja Saga." });
        }

        [HttpGet("clan-gains")]
        public async Task<IActionResult> GetClanGains([FromQuery] string clanId)
        {
            if (string.IsNullOrWhiteSpace(clanId))
                return BadRequest(new { error = "clanId is required" });

            var gains = await _context.MemberReputationLogs
                .Where(l => l.ClanId == clanId)
                .GroupBy(l => l.MemberName)
                .Select(g => new
                {
                    MemberName = g.Key,
                    LatestPoints = g.OrderByDescending(x => x.Timestamp).Select(x => x.Points).FirstOrDefault(),
                    TotalGain = 0 // Needs complex lag/lead logic, simplify for now
                })
                .ToListAsync();

            return Ok(gains);
        }
    }
}

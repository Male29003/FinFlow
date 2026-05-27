using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Application.Helpers;
public static class StringHelper
{
    // Siêu hàm: Vừa lột Emoji, vừa lột dấu tiếng Việt, vừa ép viết thường
    public static string NormalizeName(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";

        // 1. Lột Emoji & Ký hiệu
        var noEmoji = Regex.Replace(text, @"\p{Cs}|\p{So}|\p{C}", "");

        // 2. Lột dấu tiếng Việt
        var normalizedString = noEmoji.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder();

        foreach (var c in normalizedString)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        var noTone = stringBuilder.ToString().Normalize(NormalizationForm.FormC)
                                  .Replace("đ", "d").Replace("Đ", "D");

        // 3. Xóa khoảng trắng thừa và ép về chữ thường
        return noTone.Trim().ToLower();
    }
}

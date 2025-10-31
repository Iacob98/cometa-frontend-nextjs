import { NextResponse } from 'next/server';

export async function GET() {
  // Return HTML page with token clearing script
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Clear Auth Tokens</title>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            background: white;
            padding: 3rem;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 400px;
        }
        h1 {
            color: #333;
            margin-bottom: 1rem;
        }
        .info {
            color: #666;
            margin-bottom: 2rem;
            line-height: 1.6;
        }
        button {
            background: #dc2626;
            color: white;
            border: none;
            padding: 14px 32px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
        }
        button:hover {
            background: #b91c1c;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        }
        .status {
            margin-top: 1rem;
            padding: 1rem;
            border-radius: 6px;
            display: none;
        }
        .status.success {
            background: #dcfce7;
            color: #166534;
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Очистка токенов</h1>
        <p class="info">
            Нажмите кнопку чтобы удалить старые токены авторизации и войти заново.
            <br><br>
            Это исправит проблему с загрузкой типов грунта.
        </p>
        <button onclick="clearTokensAndRedirect()">
            Очистить токены
        </button>
        <div id="status" class="status"></div>

        <script>
            function clearTokensAndRedirect() {
                const statusDiv = document.getElementById('status');

                try {
                    // Clear localStorage
                    localStorage.removeItem('cometa_auth_token');
                    localStorage.removeItem('cometa_refresh_token');
                    localStorage.removeItem('cometa_user');

                    // Clear all localStorage to be sure
                    localStorage.clear();

                    // Clear cookies
                    document.cookie.split(";").forEach(function(c) {
                        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                    });

                    // Show success
                    statusDiv.className = 'status success';
                    statusDiv.textContent = '✅ Токены успешно удалены! Перенаправление...';

                    // Redirect after 1 second
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1000);

                } catch (error) {
                    statusDiv.className = 'status error';
                    statusDiv.style.background = '#fee2e2';
                    statusDiv.style.color = '#991b1b';
                    statusDiv.style.display = 'block';
                    statusDiv.textContent = '❌ Ошибка: ' + error.message;
                }
            }

            // Auto-run on page load if ?auto=1 parameter is present
            if (window.location.search.includes('auto=1')) {
                clearTokensAndRedirect();
            }
        </script>
    </div>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

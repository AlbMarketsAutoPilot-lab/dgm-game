using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.UI;
using Microsoft.UI.Windowing;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.Web.WebView2.Core;
using Windows.ApplicationModel;
using Windows.Graphics;

namespace DGM;

// One window: the game (Game\, the built game) inside WebView2, like the Android app's WebView.
// Its files are served from the package on a fixed https address, so the game works offline and
// its saved games (localStorage) stay in one place: the package's own folder, which Windows
// deletes when the app is uninstalled. Made from the owner's KAJ app.
public sealed class GameWindow : Window
{
    private const string Host = "dgm.example";
    private const string StartUrl = "https://" + Host + "/index.html";
    // The game's ink colour (app.css, --ink), shown while the game loads, as in the Android app.
    private static readonly Windows.UI.Color Background = ColorHelper.FromArgb(255, 0x4b, 0x23, 0x77);
    // As in KAJ. The game has its own layouts for wide and narrow windows (app.css).
    private const int MinWidth = 800, MinHeight = 480;
    private const int StartWidth = 1280, StartHeight = 720;

    private readonly WebView2 web = new();
    private readonly OverlappedPresenter windowed = OverlappedPresenter.Create();

    public GameWindow()
    {
        Title = "Don’t Get Mad";
        Content = new Grid { Background = new SolidColorBrush(Background), Children = { web } };
        PlaceWindow();
        _ = ShowGameAsync();
    }

    [DllImport("user32.dll")]
    private static extern uint GetDpiForWindow(IntPtr hwnd);

    // Opens at 1280 × 720 (or the screen, if smaller), centred, with a minimum size.
    private void PlaceWindow()
    {
        double scale = GetDpiForWindow(WinRT.Interop.WindowNative.GetWindowHandle(this)) / 96.0;
        windowed.PreferredMinimumWidth = (int)(MinWidth * scale);
        windowed.PreferredMinimumHeight = (int)(MinHeight * scale);
        AppWindow.SetPresenter(windowed);
        RectInt32 area = DisplayArea.GetFromWindowId(AppWindow.Id, DisplayAreaFallback.Primary).WorkArea;
        int w = Math.Min((int)(StartWidth * scale), area.Width);
        int h = Math.Min((int)(StartHeight * scale), area.Height);
        AppWindow.MoveAndResize(new RectInt32(area.X + (area.Width - w) / 2, area.Y + (area.Height - h) / 2, w, h));
    }

    private async Task ShowGameAsync()
    {
        try
        {
            // Empty, or an error, when the WebView2 Runtime is missing (a few Windows 10 PCs).
            if (string.IsNullOrEmpty(CoreWebView2Environment.GetAvailableBrowserVersionString()))
            {
                ShowMissingRuntime();
                return;
            }
            web.DefaultBackgroundColor = Background;
            await web.EnsureCoreWebView2Async();
        }
        catch (Exception)
        {
            ShowMissingRuntime();
            return;
        }

        CoreWebView2 core = web.CoreWebView2;
        // A game, not a browser: no right-click menu, zoom, reload (F5), find, print or developer tools.
        CoreWebView2Settings settings = core.Settings;
        settings.AreDefaultContextMenusEnabled = false;
        settings.AreDevToolsEnabled = false;
        settings.AreBrowserAcceleratorKeysEnabled = false;
        settings.IsZoomControlEnabled = false;
        settings.IsPinchZoomEnabled = false;
        settings.IsSwipeNavigationEnabled = false;
        settings.IsStatusBarEnabled = false;
        settings.IsGeneralAutofillEnabled = false;
        settings.IsPasswordAutosaveEnabled = false;
        settings.AreHostObjectsAllowed = false;

        core.SetVirtualHostNameToFolderMapping(Host,
            Path.Combine(Package.Current.InstalledLocation.Path, "Game"),
            CoreWebView2HostResourceAccessKind.Deny);
        // The game never leaves its own files; nothing else opens. "Back to the game" on the
        // Copyright and Privacy pages opens "./": that is the game's page.
        core.NavigationStarting += (_, e) =>
        {
            if (!e.Uri.StartsWith("https://" + Host + "/", StringComparison.OrdinalIgnoreCase)) e.Cancel = true;
            else if (e.Uri.Equals("https://" + Host + "/", StringComparison.OrdinalIgnoreCase))
            {
                e.Cancel = true;
                core.Navigate(StartUrl);
            }
        };
        core.NewWindowRequested += (_, e) => e.Handled = true;
        core.WebMessageReceived += (_, e) => OnGameMessage(e.TryGetWebMessageAsString());
        // The web engine stopped (low memory or a crash): open the game again. The start screen
        // then offers to continue the saved game.
        core.ProcessFailed += (_, e) =>
        {
            if (e.ProcessFailedKind == CoreWebView2ProcessFailedKind.RenderProcessExited
                || e.ProcessFailedKind == CoreWebView2ProcessFailedKind.RenderProcessUnresponsive)
            {
                core.Navigate(StartUrl);
            }
        };
        core.Navigate(StartUrl);
    }

    // Messages from the game (src/ui/windows.ts, public/legal.js): "leave" closes the app (Esc on
    // the start screen), "fullscreen" is F11.
    private void OnGameMessage(string message)
    {
        if (message == "leave")
        {
            Close();
        }
        else if (message == "fullscreen")
        {
            if (AppWindow.Presenter.Kind == AppWindowPresenterKind.FullScreen) AppWindow.SetPresenter(windowed);
            else AppWindow.SetPresenter(FullScreenPresenter.Create());
        }
    }

    private void ShowMissingRuntime()
    {
        Content = new Grid
        {
            Background = new SolidColorBrush(Background),
            Children =
            {
                new TextBlock
                {
                    Text = "Don’t Get Mad needs the Microsoft Edge WebView2 Runtime, which this PC does not have.\n\n"
                        + "Please install it from Microsoft's page:\n"
                        + "https://developer.microsoft.com/microsoft-edge/webview2/consumer/\n\n"
                        + "Then open the game again.",
                    Foreground = new SolidColorBrush(Colors.White),
                    FontSize = 18,
                    TextWrapping = TextWrapping.Wrap,
                    IsTextSelectionEnabled = true,
                    TextAlignment = TextAlignment.Center,
                    HorizontalAlignment = HorizontalAlignment.Center,
                    VerticalAlignment = VerticalAlignment.Center,
                    Margin = new Thickness(32),
                },
            },
        };
    }
}

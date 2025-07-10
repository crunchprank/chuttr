# Chuttr

**Chuttr** is a Chrome extension that cleans up Twitch chat by filtering out spam, noise, and junk in real-time so you can actually enjoy the stream without all the clutter.

This tool was made for people watching or chatting, not streamers, since there's always a chance it might block something by mistake.

## Features

- Filter excessive capital letters
- Remove repeated characters
- Block known spam domains (e.g., `.xyz`, `.tk`, `.win`)
- Limit the number of emotes per message
- Custom keyword filtering (e.g., `follow4follow`, `buy follows`)
- User-friendly popup UI with configurable options

## How to Use

1. Clone or download this repository.
2. In Chrome, go to `chrome://extensions/`
3. Enable Developer Mode (top right).
4. Click "Load unpacked" and select the `chuttr` folder.
5. Head to [https://twitch.tv](https://twitch.tv) and open any stream.
6. Open the Chuttr popup to configure your filters.

## Monitoring Filtered Messages

To see which chat messages are being filtered:

1. Right-click the Twitch page and choose "Inspect" to open DevTools (or press F12).
2. Click the Console tab.
3. As messages get filtered, Chuttr will log the username and message that was removed.

This is helpful if you're tweaking settings and want to know what's getting caught.

## Extension Settings

You can turn each filter on or off, and adjust how strict they are using the text fields.

| Filter             | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| Excessive Caps     | Blocks messages where the majority of text is uppercase (defaults: 0.6 (or 60%)).               |
| Repetition         | Filters out messages with repeated characters (e.g., `heyyyyyyyy`).         |
| Link Domains       | Filters messages containing links with domains you specify (defaults: `xyz`, `win`, `tk`). |
| Emote Count        | Blocks messages with too many emotes (default: 10).                         |
| Keywords           | Filters any message containing the provided keywords (e.g., `follow4follow`, `buy follows`). |

## Contributing

Pull requests welcome. If you have an idea for a new filter or UI tweak, or run into a bug, feel free to open an issue or PR.

## License

This project is open source under the [MIT License](LICENSE).

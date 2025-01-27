# Voice Widget Integration Guide for Framer

This guide explains how to integrate and use the voice widget in your Framer project.

## Quick Start

1. Add the voice widget script to your Framer project's `<head>` section:

```html
<script
  src="https://your-domain.com/voice-widget.js"
  data-config-id="your-config-id"
></script>
```

## Configuration

### Script Attributes

- `data-config-id`: (Optional) Specify a configuration ID for custom settings. Defaults to "default" if not provided.
- `theme`: (Optional) Currently supports "mcdonalds" theme.

## Features

The voice widget provides:

- Floating circular widget in the bottom-right corner
- Conversation bubble for displaying messages
- Voice input/output capabilities
- Responsive design that works across all devices
- Smooth animations and visual feedback
- Accessibility support

## Widget Behavior

The widget includes several interactive features:

1. **Visual Feedback**:

   - Hover effect: Slight scale increase
   - Active state: Pulsing animation
   - Volume feedback: Widget scales based on voice input volume

2. **Conversation Display**:

   - Messages appear in a bubble above the widget
   - User messages appear in theme color
   - Assistant messages appear in default text color
   - Messages auto-hide after 5 seconds of inactivity

3. **Error Handling**:
   - Displays error messages in red bubble
   - Auto-dismisses error messages after 3 seconds

## Styling

The widget comes with default styling that includes:

- Fixed positioning at bottom-right (16px margin)
- 96x96px circular iframe
- Transparent background
- Smooth animations
- Responsive design that adjusts to viewport

## Technical Details

The widget:

- Creates an iframe for the voice interface
- Handles cross-origin communication
- Manages microphone permissions
- Automatically adjusts to window resizing
- Supports screen readers and keyboard navigation

## Browser Support

The widget is compatible with modern browsers that support:

- iframe messaging
- Web Speech API
- CSS transforms and animations
- Backdrop filters

## Troubleshooting

If the widget doesn't appear:

1. Ensure the script is properly loaded
2. Check browser console for errors
3. Verify the config-id is correct
4. Ensure microphone permissions are granted

## Example Implementation

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Voice Widget Demo</title>
    <script src="/voice-widget.js" data-config-id="default"></script>
  </head>
  <body>
    <!-- Your content here -->
  </body>
</html>
```

The widget will automatically initialize and position itself in the bottom-right corner of your page.

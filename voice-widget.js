(function() {
  const createVoiceWidget = () => {
    // Create container for better positioning and accessibility
    const container = document.createElement('div');
    const iframe = document.createElement('iframe');
    const conversationBubble = document.createElement('div');

    // Set container attributes with fixed positioning
    const containerStyles = {
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      maxWidth: '100vw',
      maxHeight: 'calc(100vh - 32px)',
      zIndex: '999999',
      margin: '0',
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '8px'
    };

    // Set conversation bubble styles
    const bubbleStyles = {
      maxWidth: '320px',
      padding: '12px 16px',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '12px',
      boxShadow: 'none',
      marginBottom: '8px',
      color: '#333',
      fontSize: '14px',
      lineHeight: '1.4',
      display: 'none',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.3s ease'
    };

    // Set iframe attributes optimized for voice widget
    const iframeStyles = {
      width: '96px',
      height: '96px',
      border: 'none',
      borderRadius: '50%',
      background: 'transparent',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      boxShadow: 'none',
      cursor: 'pointer',
      animation: 'float 3s ease-in-out infinite'
    };

    Object.assign(container.style, containerStyles);
    Object.assign(conversationBubble.style, bubbleStyles);
    Object.assign(iframe.style, iframeStyles);

    // Add accessibility and interaction attributes
    iframe.setAttribute('title', 'Voice Assistant Widget');
    iframe.setAttribute('aria-label', 'Voice Assistant - Click to start speaking');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('allow', 'microphone');
    iframe.style.pointerEvents = 'all';

    const script = document.currentScript;
    const configId = script?.getAttribute('data-config-id') || 'default';

    // Update to use the app's voice widget URL with Vapi configuration
    iframe.src = `https://voice-agent-xi.vercel.app//voice-widget?configId=${configId}&theme=mcdonalds`;

    // Add elements to DOM
    container.appendChild(conversationBubble);
    container.appendChild(iframe);
    document.body.appendChild(container);

    // Add animations style
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
        100% { transform: translateY(0px); }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      .ripple {
        animation: pulse 1s infinite !important;
      }
      iframe:hover {
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(style);

    // Handle iframe load
    iframe.onload = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const rootStyles = {
            background: 'transparent',
            margin: '0',
            padding: '0'
          };
          Object.assign(iframeDoc.documentElement.style, rootStyles);
          Object.assign(iframeDoc.body.style, rootStyles);
        }
      } catch (e) {
        console.warn('Could not access iframe document:', e);
      }
    };

    // Track states
    let wasActive = false;
    let messageTimeout;

    // Helper to show message with timeout
    const showMessage = (text, color = '#333', duration = 3000) => {
      // Clear any existing timeout
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }

      conversationBubble.textContent = text;
      conversationBubble.style.display = 'block';
      conversationBubble.style.color = color;

      if (duration > 0) {
        messageTimeout = setTimeout(() => {
          conversationBubble.style.display = 'none';
        }, duration);
      }
    };

    // Handle widget state changes and messages from iframe
    window.addEventListener('message', (event) => {
      if (event.origin !== 'https://voice-agent-xi.vercel.app/') return;

      if (event.data.type === 'vapiState') {
        const { state, volumeLevel, conversation } = event.data;

        // Update active state
        if (state === 'active') {
          wasActive = true;
        }

        // Handle conversation display
        if (state === 'idle' && wasActive && !conversation) {
          showMessage('Call ended. Thank you for using voice assistant!');
          wasActive = false;
        } else if (conversation) {
          const color = event.data.role === 'user' ? '#DA291C' : '#333';
          showMessage(conversation, color, state === 'loading' ? 0 : 3000);
        }

        // Apply scale transform based on volume
        const scale = 1 + Math.min(volumeLevel * 0.5, 0.3);
        iframe.style.transform = `scale(${scale})`;

        // Handle different states
        if (state === 'active') {
          iframe.classList.add('ripple');
          iframe.classList.remove('loading');
        } else {
          iframe.classList.remove('ripple', 'loading');
        }
      }

      // Handle errors
      if (event.data.type === 'vapiError') {
        showMessage('Sorry, something went wrong. Please try again.');
        conversationBubble.style.background = 'rgba(255, 0, 0, 0.1)';
      }
    });

    // Handle window resize
    let windowResizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(windowResizeTimeout);
      windowResizeTimeout = setTimeout(() => {
        const maxWidth = Math.min(320, window.innerWidth - 32);
        const maxHeight = window.innerHeight - 32;

        const currentWidth = parseInt(iframe.style.width);
        const currentHeight = parseInt(iframe.style.height);

        iframe.style.width = Math.min(currentWidth, maxWidth) + 'px';
        iframe.style.height = Math.min(currentHeight, maxHeight) + 'px';
      }, 100);
    });
  };

  // Initialize widget
  if (document.readyState === 'complete') {
    createVoiceWidget();
  } else {
    window.addEventListener('load', createVoiceWidget);
  }
})();

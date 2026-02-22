import React from 'react';

const getMeetUrl = (value) => {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const isAllowedMeetHost = (hostname) => {
  if (!hostname) return false;
  return hostname === 'meet.google.com' || hostname.endsWith('.meet.google.com');
};

class GoogleMeetErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const RenderContent = ({ renderContent, url, title, iframeClassName, className }) => {
  if (renderContent) {
    return renderContent({ url, title, iframeClassName, className });
  }
  return (
    <iframe
      title={title}
      src={url.toString()}
      allow="camera; microphone; fullscreen; speaker; display-capture"
      referrerPolicy="no-referrer"
      className={`${iframeClassName} ${className}`}
    />
  );
};

const defaultFallback = (
  <div className="flex flex-col items-center justify-center text-center h-105 px-6" role="alert" aria-live="assertive">
    <p className="text-sm font-medium text-white">Unable to load the meeting.</p>
    <p className="text-xs text-slate-300 mt-1">Refresh the page or open in a new tab.</p>
  </div>
);

const GoogleMeetEmbed = ({
  meetingLink,
  title = 'Google Meet Session',
  className = '',
  iframeClassName = 'w-full h-105 md:h-130 lg:h-160',
  fallback = defaultFallback,
  renderContent,
}) => {
  const url = getMeetUrl(meetingLink);
  const invalidUrl = !url || url.protocol !== 'https:' || !isAllowedMeetHost(url.hostname);
  if (invalidUrl) {
    return (
      <div className={`flex flex-col items-center justify-center text-center h-105 px-6 ${className}`} role="alert" aria-live="polite">
        <p className="text-sm font-medium text-white">Meeting link unavailable.</p>
        <p className="text-xs text-slate-300 mt-1">Contact support or refresh to try again.</p>
      </div>
    );
  }

  return (
    <GoogleMeetErrorBoundary fallback={fallback}>
      <RenderContent
        renderContent={renderContent}
        url={url}
        title={title}
        iframeClassName={iframeClassName}
        className={className}
      />
    </GoogleMeetErrorBoundary>
  );
};

export default GoogleMeetEmbed;

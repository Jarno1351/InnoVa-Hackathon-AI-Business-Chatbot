export default function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="settings-modal open" onClick={(event) => event.target === event.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label="Settings">
      <div className="settings-panel">
        <div className="settings-header">
          <div>
            <p className="top-kicker">Preferences</p>
            <h2>Settings</h2>
          </div>
          <button className="drawer-close" type="button" onClick={onClose} aria-label="Close settings">×</button>
        </div>
        <div className="settings-content">
          <div className="settings-row"><span>Theme</span><strong>Dark Purple</strong></div>
          <div className="settings-row"><span>Chat mode</span><strong>Local suppliers first</strong></div>
          <div className="settings-row"><span>Prototype status</span><strong>Connected-ready React UI</strong></div>
        </div>
      </div>
    </div>
  );
}

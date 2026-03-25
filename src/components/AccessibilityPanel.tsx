import React, { useEffect } from 'react';
import { useAccessibilityStore, applyAccessibilityClasses } from '../utils/accessibility';

/**
 * Accessibility settings panel
 * Allows users to configure WCAG AAA accessibility options
 */
export function AccessibilityPanel() {
  const settings = useAccessibilityStore();

  // Apply settings whenever they change
  useEffect(() => {
    applyAccessibilityClasses({
      highContrast: settings.highContrast,
      dyslexicFont: settings.dyslexicFont,
      reduceMotion: settings.reduceMotion,
      reduceFlash: settings.reduceFlash,
      hapticFeedback: settings.hapticFeedback,
      increasedFontSize: settings.increasedFontSize,
      colorblindMode: settings.colorblindMode,
    });
  }, [settings.highContrast, settings.dyslexicFont, settings.reduceMotion, 
      settings.reduceFlash, settings.hapticFeedback, settings.increasedFontSize, 
      settings.colorblindMode]);

  // Load system preferences on mount
  useEffect(() => {
    settings.loadSystemPreferences();
  }, []);

  return (
    <div className="accessibility-panel" role="region" aria-label="Accessibility settings">
      <h2>Accessibility Settings</h2>
      
      {/* High Contrast */}
      <fieldset className="a11y-fieldset">
        <legend>Vision</legend>
        
        <label className="a11y-checkbox-label">
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={(e) => settings.setHighContrast(e.target.checked)}
            aria-label="Enable high contrast mode"
          />
          <span>High Contrast</span>
        </label>

        <label className="a11y-checkbox-label">
          <input
            type="checkbox"
            checked={settings.dyslexicFont}
            onChange={(e) => settings.setDyslexicFont(e.target.checked)}
            aria-label="Use dyslexic-friendly font"
          />
          <span>OpenDyslexic Font</span>
        </label>

        {/* Font Size */}
        <label className="a11y-label">
          <span>Font Size</span>
          <select
            value={settings.increasedFontSize}
            onChange={(e) =>
              settings.setFontSize(
                e.target.value as '100' | '125' | '150'
              )
            }
            aria-label="Adjust font size"
          >
            <option value="100">100% (Normal)</option>
            <option value="125">125% (Large)</option>
            <option value="150">150% (Extra Large)</option>
          </select>
        </label>

        {/* Colorblind Mode */}
        <label className="a11y-label">
          <span>Color Blindness Mode</span>
          <select
            value={settings.colorblindMode}
            onChange={(e) =>
              settings.setColorblindMode(
                e.target.value as
                  | 'none'
                  | 'deuteranopia'
                  | 'protanopia'
                  | 'tritanopia'
              )
            }
            aria-label="Select color blindness simulation mode"
          >
            <option value="none">None (Normal vision)</option>
            <option value="deuteranopia">Deuteranopia (Red-blind)</option>
            <option value="protanopia">Protanopia (Red-blind, severe)</option>
            <option value="tritanopia">Tritanopia (Blue-yellow blind)</option>
          </select>
        </label>
      </fieldset>

      {/* Motion & Flash */}
      <fieldset className="a11y-fieldset">
        <legend>Motion & Animation</legend>

        <label className="a11y-checkbox-label">
          <input
            type="checkbox"
            checked={settings.reduceMotion}
            onChange={(e) => settings.setReduceMotion(e.target.checked)}
            aria-label="Reduce motion and animations"
          />
          <span>Reduce Motion</span>
        </label>

        <label className="a11y-checkbox-label">
          <input
            type="checkbox"
            checked={settings.reduceFlash}
            onChange={(e) => settings.setReduceFlash(e.target.checked)}
            aria-label="Reduce flashing light effects"
          />
          <span>Reduce Flash</span>
        </label>

        <p className="a11y-hint">
          These settings help reduce eye strain and provide relief for
          photosensitivity and vestibular disorders.
        </p>
      </fieldset>

      {/* Haptic Feedback */}
      <fieldset className="a11y-fieldset">
        <legend>Feedback</legend>

        <label className="a11y-checkbox-label">
          <input
            type="checkbox"
            checked={settings.hapticFeedback}
            onChange={(e) => settings.setHapticFeedback(e.target.checked)}
            aria-label="Enable vibration feedback on compatible devices"
          />
          <span>Haptic Feedback (Vibration)</span>
        </label>

        <p className="a11y-hint">
          Vibration feedback helps provide tactile confirmation of actions
          on mobile devices.
        </p>
      </fieldset>

      {/* Reset Button */}
      <button
        className="a11y-reset-btn"
        onClick={() => settings.reset()}
        aria-label="Reset accessibility settings to defaults"
      >
        Reset to Defaults
      </button>
    </div>
  );
}

/**
 * Smaller accessibility quick-toggle (for top-level navigation)
 */
export function AccessibilityQuickToggle() {
  const [showPanel, setShowPanel] = React.useState(false);

  return (
    <div className="accessibility-quick-toggle">
      <button
        className="toggle-btn"
        onClick={() => setShowPanel(!showPanel)}
        aria-label="Open accessibility settings"
        aria-expanded={showPanel}
      >
        ⚙️ A11y
      </button>
      {showPanel && (
        <div className="quick-panel">
          <AccessibilityPanel />
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react'
import {
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupButton,
  ListGroup,
  ListGroupItem,
} from 'reactstrap'

// Code for the settings component
import { connectSettings } from 'actions/settings'

// Style for settings-container
const settingsStyle = {
  paddingRight: "10px",
  paddingLeft: "10px",
}

const ulStyle = {
  textAlign: "center",
  height: "100px",
}

const Settings = ({
  title,
  name,

  initialized,
  settings,
  settingsKey, // Current settings key, useful for `setDefault`
  globalSettings,
  savedSettings,

  updateSettings, // (updates)
  updateGlobalSettings, // (updates)
  resetSettings, // ()
  resetGlobalSettings, // ()

  // Async actions.
  saveSettingsAs, // (key)
  saveSettings, // ()
  loadSettings, // (key)
  deleteSettings, // (key)
  setDefaultSettings, // (key)
  toggleFavoriteSettings, // (key)

  reorderSettings, // (from, to)

  undoSettings,
  redoSettings,
  canUndo,
  canRedo,
}) => {
  const [settingsKeyInput, setSettingsKeyInput] = useState("")
  const [canSaveAs, setCanSaveAs] = useState(false)
  const [canSave, setCanSave] = useState(false)
  const [lastSavedSettings, setLastSavedSettings] = useState(settings)
  const [isLoadingSettings, setLoadingSettings] = useState(false)

  useEffect(() => {
    if (isLoadingSettings) {
      setLastSavedSettings(settings)
      setLoadingSettings(false)
    }
  }, [settings])

  // Set last saved settings to `settings` when settingsKey changes.
  useEffect(() => {
    setSettingsKeyInput(settingsKey || "")
    setLastSavedSettings(settings)
  }, [settingsKey])

  // Effects used to determine if saving would change anything / what it would
  // change.
  useEffect(() => {
    setCanSaveAs(settingsKeyInput && settingsKey !== settingsKeyInput.trim())
  }, [settingsKeyInput, settingsKey])
  useEffect(() => {
    setCanSave(settingsKeyInput.trim() && lastSavedSettings !== settings)
  }, [settingsKeyInput, lastSavedSettings, settings])

  return (

    <div style={settingsStyle} id="settings-container">
      <InputGroup>
        <Input
          defaultValue={settingsKey}
          onChange={e => setSettingsKeyInput(e.target.value)}
        />
        <InputGroupAddon addonType="append">
        {
          canSaveAs ? (
            <Button onClick={() => saveSettingsAs(settingsKeyInput.trim())}>
              Save As
            </Button>
          ) : (
            <Button disabled={!canSave}
              onClick={() => {
                setLastSavedSettings(settings) // get rid of enable-disable flip
                saveSettings()
              }}>Save</Button>
          )
        }

        </InputGroupAddon>
      </InputGroup>
      <hr/>
      <Button disabled={!canUndo} onClick={() => undoSettings()}>Undo</Button>
      &nbsp;
      <Button disabled={!canRedo} onClick={() => redoSettings()}>Redo</Button>
      &nbsp;
      
      <hr/>
      <ListGroup>
        {
          savedSettings.map(({ key, data, favorite }) => (
            <ListGroupItem
              active={key === settingsKey}
              key={key}
            >
              <Button style={{maxWidth: "80%"}} onClick={() => {
                setCanSaveAs(false)
                setCanSave(false)
                if (settingsKey) saveSettingsAs(settingsKey)
                loadSettings(key)
                setLoadingSettings(true)
              }}>
                {key}
              </Button>
              <Button style={{position: "relative", float: "right"}}
                      onClick={() => deleteSettings(key)}>
              X</Button>
              <Button style={{position: "relative", float: "right"}}
                      onClick={() => setDefaultSettings(key)}>
              D</Button>
            </ListGroupItem>
          ))
        }
      </ListGroup>
      <hr/>
      <Button style={{width: "100%"}} onClick={() => resetSettings()}>
        Reset
      </Button>
    </div>
  )
}

export default connectSettings(Settings)

import "./App.css";
import { useRef, useState, useEffect, useCallback } from "react";
import { getAllPackages } from "./utility/Magento.service";
import ENV_CONFIG from "./utility/ENV.config";
import { mapChannelToPacksBySearchQuery } from "./utility/ChannelMapping.utility";
import DropdownSelect from "./components/DropdownSelect";
function App() {
  const firstRender = useRef(true);
  const [error, setError] = useState();
  const [activeEnvironmentState, setActiveEnvironmentState] = useState(
    ENV_CONFIG.PRODUCTION
  );
  const currentEnvRef = useRef(activeEnvironmentState);
  const screenDataRef = useRef();
  const [searchTerm, setSearchTerm] = useState("espn");
  const [filteredItems, setFilteredItems] = useState();

  useEffect(() => {
    const getChannelsAndPackagesAndUpdateScreenData = async () => {
      try {
        const ac_packages = await getAllPackages(
          activeEnvironmentState.MAGENTO_HOST
        );
        const sms_channels = Object.keys(
          activeEnvironmentState.SMS_CHANNELS.channel_map
        ).map((key) => activeEnvironmentState.SMS_CHANNELS.channel_map[key]);
        screenDataRef.current = { sms_channels, ac_packages };
        return Promise.resolve();
      } catch (error) {
        setError(error);
      }
    };

    const init = async () => {
      const environmentChanged =
        currentEnvRef.current.NAME !== activeEnvironmentState.NAME;
      // Environment Changed
      if (environmentChanged) {
        currentEnvRef.current = activeEnvironmentState;
        await getChannelsAndPackagesAndUpdateScreenData();
        handleChannelSearchChange({ target: { value: searchTerm } });
        // First time Render
      } else if (firstRender.current) {
        firstRender.current = false;
        if (
          !screenDataRef.current?.ac_packages &&
          !screenDataRef.current?.sms_channels
        ) {
          await getChannelsAndPackagesAndUpdateScreenData();
          // Only search if we have a default placeholder in the input field
          searchTerm &&
            handleChannelSearchChange({ target: { value: searchTerm } });
        }
      }
    };

    init();
  }, [activeEnvironmentState]);

  const handleEnvironmentChange = useCallback(
    (event) => {
      const environment = event.target.value;
      setActiveEnvironmentState(ENV_CONFIG[environment]);
    },
    [activeEnvironmentState]
  );

  const handleChannelSearchChange = useCallback((event) => {
    const inputField = event?.target?.value;
    if (!inputField) {
      setFilteredItems([]);
      setSearchTerm(inputField);
      return;
    }
    setSearchTerm(inputField);
    const channelToPacksData = mapChannelToPacksBySearchQuery({
      channels: screenDataRef.current?.sms_channels,
      packages: screenDataRef.current?.ac_packages,
      inputField,
    });
    setFilteredItems(channelToPacksData);
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <h1>SMS AC Channels </h1>
        <DropdownSelect
          items={Object.keys(ENV_CONFIG)}
          defaultValue={activeEnvironmentState?.NAME}
          selectionText={'Current Environment:'}
          onChange={handleEnvironmentChange} />

      </header>
      <div className="Search-Container">
        <h2>Search for a Channel </h2>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleChannelSearchChange}
        />

        <div className="list-container">
          {filteredItems
            ? filteredItems?.map((item, index) => (
                <div className="list-container-item" key={index}>
                  <h2>SMS Channel</h2>
                  <pre>{JSON.stringify(item?.channel, null, 2)}</pre>
                  <h2>AC Packages</h2>
                  <pre>{JSON.stringify(item?.packages, null, 2)}</pre>
                  <h2>
                    Channel Found in AC Packages but did not match SMS Pack
                    Guids
                  </h2>
                  <pre>{JSON.stringify(item?.other_packages, null, 2)}</pre>
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}

export default App;

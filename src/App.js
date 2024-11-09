import logo from "./logo.svg";
import "./App.css";
import { useRef, useState, useEffect, useCallback } from "react";
import sms from "./api/beta.sms.channels";
function App() {
  const firstRender = useRef(true);
  const [error, setError] = useState();
  const [data, setData] = useState();
  const [searchTerm, setSearchTerm] = useState("al yawm");
  const [filteredItems, setFilteredItems] = useState();

  useEffect(() => {
    const getChannelsFromSMS = async () => {
      try {
        const allPackagesGraphQL = await fetch(
          `https://b.slingcommerce.com/graphql?query=query packages($filter: PackageAttributeFilterInput) { packages(filter: $filter) { items { package { sku canonical_identifier priority name package_type line_of_business base_price plan_package_price item_guid plan_offer_price default_classification channels { call_sign name } addons { sku } excluded_packages { sku } } } } }&operationName=packages&variables={"filter":{"is_channel_required":{"eq":true}}}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );
        const packagesQueryResponse = await allPackagesGraphQL.json();
        const ac_packages = packagesQueryResponse.data.packages.items.package;
        const sms_channels = Object.keys(sms.channel_map).map(
          (key) => sms.channel_map[key]
        );
        setData({ sms_channels, ac_packages });
      } catch (error) {
        setError(error);
      }
    };

    if (!data?.ac_packages && !data?.sms_channels) {
      getChannelsFromSMS();
    }
    if (firstRender.current && data?.ac_packages && data?.sms_channels && searchTerm) {
      firstRender.current = false;
      handleChange({target: {value: searchTerm}});
    }
  }, [data]);

  const handleChange = useCallback(
    (event) => {
      const term = event?.target?.value;
      if (!term) {
        setFilteredItems([]);
        setSearchTerm(term);
        return;
      }
      setSearchTerm(term);

      // Filter items based on the search term
      const filtered = data.sms_channels.filter(
        (item) =>
          item && item?.channel_name.toLowerCase().includes(term.toLowerCase())
      ).map(channel => {
        const sub_pack_guids = channel?.sub_pack_guids;
        const packages = sub_pack_guids.map(packGuid => {
          const pack = data?.ac_packages?.find((pack) => pack?.item_guid === packGuid);

          if (pack) {
            const {item_guid, sku, name, package_type} = pack;
            return {
              item_guid, sku, name, package_type
            }
          }
          return null;
        }).filter(Boolean);
        const packagesIncludingChannelButNotMatchSmsGuids = !packages?.length ? data?.ac_packages?.map(pack => {
          const channelFoundInPack = pack?.channels?.find(i => i?.name?.toLowerCase()?.includes(channel?.channel_name?.toLowerCase()));
          if (channelFoundInPack) {
            const {item_guid, sku, name, package_type} = pack;
            return {item_guid, sku, name, package_type};
          }
        }).filter(Boolean) : {};

        return packages ?
        {
          channel: {
            call_sign: channel?.call_sign,
            name: channel?.channel_name,
            guid: channel?.guid,
            sub_pack_guids: channel?.sub_pack_guids?.join(', ')
          },
          packages,
          other_packages: packagesIncludingChannelButNotMatchSmsGuids,
        } : null;
      }).filter(Boolean).splice(0, 10);
      setFilteredItems(filtered);
    },
    [data]
  );
  return (
    <div className="App">
      <header className="App-header">
        <h1>SMS AC Channels </h1>
      </header>
      <div className="Search-Container">
        <h2>Results </h2>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleChange}
        />
        <div className="list-container">
          {filteredItems
            ? filteredItems?.map((item, index) => (
                <div className="list-container-item" key={index}>
                  <h2>SMS Channel</h2>
                  <pre>{JSON.stringify(item?.channel, null, 2)}</pre>
                  <h2>AC Packages</h2>
                  <pre>{JSON.stringify(item?.packages, null, 2)}</pre>
                  <h2>Channel Found in AC Packages but did not match SMS Pack Guids</h2>
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

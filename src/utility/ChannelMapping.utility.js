const mapChannelToPacksBySearchQuery = ({ channels, packages, inputField }) => {
  // Filter items based on the search term
  return channels
    .filter(
      (item) =>
        item &&
        item?.channel_name.toLowerCase().includes(inputField.toLowerCase())
    )
    .map((channel) => {
      const sub_pack_guids = channel?.sub_pack_guids;
      const packs = sub_pack_guids
        .map((packGuid) => {
          const pack = packages?.find((pack) => pack?.item_guid === packGuid);

          if (pack) {
            const { item_guid, sku, name, package_type } = pack;
            return {
              item_guid,
              sku,
              name,
              package_type,
            };
          }
          return null;
        })
        .filter(Boolean);
      const packagesIncludingChannelButNotMatchSmsGuids = !packs?.length
        ? packages
            ?.map((pack) => {
              const channelFoundInPack = pack?.channels?.find((i) =>
                i?.name
                  ?.toLowerCase()
                  ?.includes(channel?.channel_name?.toLowerCase())
              );
              if (channelFoundInPack) {
                const { item_guid, sku, name, package_type } = pack;
                return { item_guid, sku, name, package_type };
              }
            })
            .filter(Boolean)
        : {};

      return packs
        ? {
            channel: {
              call_sign: channel?.call_sign,
              name: channel?.channel_name,
              guid: channel?.guid,
              sub_pack_guids: channel?.sub_pack_guids?.join(", "),
              href: channel?.href,
            },
            packages: packs,
            other_packages: packagesIncludingChannelButNotMatchSmsGuids,
          }
        : null;
    })
    .filter(Boolean)
    .splice(0, 10);
};

export { mapChannelToPacksBySearchQuery };



const getAllPackages = async (host) => {
	try {
		const allPackages = await fetch(
			`${host}?query=query packages($filter: PackageAttributeFilterInput) {
				packages(filter: $filter) {
					items {
						package {sku canonical_identifier priority name package_type line_of_business base_price plan_package_price item_guid plan_offer_price default_classification channels { call_sign name
							} addons {
								sku
							}
							excluded_packages {
								sku
							}
						}
					}
				}
			}&operationName=packages&variables={"filter":{"is_channel_required":{"eq":true}}}`,
			{
				method: "GET",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
			}
		);

		const response =  await allPackages.json();

		return Promise.resolve(response.data.packages.items.package);

	} catch (error) {
		alert(error);
	}
};

export {getAllPackages};

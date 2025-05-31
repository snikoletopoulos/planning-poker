export const getWsToken = async (token: string) => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_UPDATER_HTTP_URL}/token`,
		{ headers: { Authorization: `Bearer ${token}` } },
	);
	if (!response.ok) throw new Error("Failed to get token");
	return await response.text();
};

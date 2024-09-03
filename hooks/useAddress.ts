import { useState, useEffect } from "react";

const useAddress = (): string | null => {
	const [address, setAddress] = useState(null);

	useEffect(() => {
		fetch("/api/auth/me")
			.then((res) => res.json())
			.then((data) => setAddress(data.address));
	}, []);

	return address;
};

export default useAddress;

export const Currencies = [
	{ value: "KES", label: "KSh Shilling", locale: "en-KE" },
	{ value: "UGX", label: "USh Shilling", locale: "en-UG" },
	{ value: "TZS", label: "TSh Shilling", locale: "sw-TZ" },
	{ value: "GBP", label: "£ Pound", locale: "en-GB" },
	{ value: "USD", label: "$ Dollar", locale: "en-US" },
	{ value: "EUR", label: "€ Euro", locale: "de-EU" },
	{ value: "JPY", label: "¥ Yen", locale: "ja-JP" },
];

export type Currency = (typeof Currencies)[0];

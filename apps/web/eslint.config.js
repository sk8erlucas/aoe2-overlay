import base from "@age-overlay/config/eslint";

export default [...base, { ignores: [".next/**", "next-env.d.ts"] }];

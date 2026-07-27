export default {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                ink: "#10212c",
                mist: "#f2f6f8",
                ocean: "#1a7f88",
                ember: "#f57f36",
                pine: "#1f5f4a"
            },
            boxShadow: {
                card: "0 20px 40px rgba(16, 33, 44, 0.12)"
            }
        }
    },
    plugins: []
};

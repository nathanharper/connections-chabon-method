export default function manifest() {
  return {
    name: "Chabon Method",
    description: "Cabon Method",
    short_name: "CHABON",
    theme_color: "#000",
    background_color: "#000",
    display: "standalone",
    start_url: "/",
    icons: [
      {
        src: "chabon.png",
        type: "image/png",
        sizes: "512x512"
      },
    ],
  };
}

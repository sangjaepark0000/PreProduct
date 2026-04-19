import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: "#0b6e99"
    },
    secondary: {
      main: "#f28f3b"
    },
    background: {
      default: "#f4f7fb",
      paper: "#ffffff"
    }
  },
  shape: {
    borderRadius: 20
  },
  typography: {
    fontFamily: "\"Segoe UI\", sans-serif",
    h1: {
      fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
      fontWeight: 700,
      letterSpacing: "-0.05em"
    },
    h5: {
      fontWeight: 600
    }
  }
});

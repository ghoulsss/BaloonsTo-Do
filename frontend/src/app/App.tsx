import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./root-layout";
import "normalize.css";
import "../css/reset.css";
import MainPage from "../feature/mainPage/MainPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <MainPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

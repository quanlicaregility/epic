import * as React from "react";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";

import { LaunchComponent } from "./launch";
import { ExternalLaunchComponent } from "./external_launch";
import { RedirectComponent } from "./redirect";

export const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<LaunchComponent params={window.location.search} />} />;
        <Route path='/external' element={<ExternalLaunchComponent params="" />} />;
        <Route path='/redirect' element={<RedirectComponent params={window.location.search} />} />;
      </Routes>
    </HashRouter>
  );
};

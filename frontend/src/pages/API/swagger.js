import React from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import openapi from "./openapi.json";

export default function Swagger() {
  console.log(openapi);
  return <SwaggerUI spec={openapi} />;
}

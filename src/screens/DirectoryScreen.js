import React from "react";
import CommunityScreen from "./CommunityScreen";
export default function DirectoryScreen(props){return <CommunityScreen {...props} initialTab={props.params?.type||"services"}/>}

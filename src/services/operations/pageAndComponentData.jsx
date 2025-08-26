import React from 'react'
import { apiConnector } from '../apiconnector';
import {toast} from "react-hot-toast"
import { catalogData } from '../apis';

export const getCatalogPageData = async (categoryId) => {
  
  let result = [];

  try {
    console.log("📦 Sending categoryId:", categoryId);

    const response = await apiConnector(
      "POST",
      catalogData.CATALOGPAGEDATA_API,
      { categoryId },
      {
        "Content-Type": "application/json",
      }
    );

    console.log("📥 Response from catalog API:", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch category page data");
    }
   
    result = response?.data;
  } catch (error) {
    
    console.log("❌ CATALOG PAGE DATA API ERROR:", error);
    toast.error(error?.response?.data?.message || error.message || "Something went wrong");
    result = {
      success: false,
      message: error?.response?.data?.message || "Catalog API failed",
    };
  }
  return result;
};



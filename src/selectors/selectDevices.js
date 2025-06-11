import { createSelector } from "@reduxjs/toolkit";

export const selectDevices = ({ filters, sort } = {}) =>
  createSelector(
    (state) => state.vault,
    (vault) => {
      const devices =
        vault.data?.devices?.filter((device) => {
          if (!!filters?.searchPattern?.length && !!device?.data) {
            return false;
          }
          return !!device.data;
        }) ?? [];

      const sortedDevices = [...devices].sort((a, b) => {
        if (sort?.key === "updatedAt") {
          return sort?.direction === "asc"
            ? a.updatedAt - b.updatedAt
            : b.updatedAt - a.updatedAt;
        }
        if (sort?.key === "createdAt") {
          return sort?.direction === "asc"
            ? a.createdAt - b.createdAt
            : b.createdAt - a.createdAt;
        }

        return 1;
      });

      return {
        isLoading: vault.isLoading,
        data: sortedDevices,
      };
    }
  );

import BigNumber from "bignumber.js";

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_FLOOR });

export default function getBn(response) {
  const responseBn = new BigNumber(response.toString());
  return responseBn;
}
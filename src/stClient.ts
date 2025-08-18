export const deposit = async ({
  amount,
  refundId,
  owner,
}: {
  amount: {
    unitType: string;
    unitToken: string;
    unitCount: number;
  };
  refundId: string;
  owner: {
    type: string;
    id: string;
  };
}) => {
  return {
    amount,
    owner,
    refundId,
  };
};

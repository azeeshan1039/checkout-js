import React, { memo } from 'react';

import { Toggle } from '../../ui/toggle';

interface ShippingOptionAdditionalDescriptionProps {
  description: string;
}

const ShippingOptionAdditionalDescription: React.FunctionComponent<
  ShippingOptionAdditionalDescriptionProps
> = ({ description }) => {
  return (
    <div className="shippingOption-additionalDescription--container">
      <Toggle openByDefault={true}>
        {() => (
          <>
            <span className="shippingOption-additionalDescription shippingOption-additionalDescription--expanded">
              {description}
            </span>
          </>
        )}
      </Toggle>
    </div>
  );
};

export default memo(ShippingOptionAdditionalDescription);

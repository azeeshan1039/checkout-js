import { ShippingOption } from '@bigcommerce/checkout-sdk';
import { format, isValid, parse } from 'date-fns';
import React, { ButtonHTMLAttributes, useEffect, useState } from 'react';
import { CalendarDay, DayPicker, Modifiers } from 'react-day-picker';

import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import { ShopperCurrency } from '../../currency';

import './CalendarStyling.scss';
import 'react-day-picker/src/style.css';

interface DeliveryDatePickerProps {
  shippingOptions?: ShippingOption[];
  isLoading: boolean;
  consignmentId: string;
  selectedShippingOptionId?: string;
  onSelectedOption: (consignmentId: string, shippingOptionId: string) => void;
}

function getDateFromDescription(description: string): Date | null {
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const parts = description.split(' ');
  let dateString = description;

  if (weekdays.includes(parts[0])) {
    dateString = parts.slice(1).join(' ');
  }

  const parsedDate = parse(dateString, 'd MMMM, yyyy', new Date());

  return isValid(parsedDate) ? parsedDate : null;
}

interface CustomDayProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  day: CalendarDay;
  modifiers: Modifiers;
  availableDatesMap: { [key: string]: ShippingOption };
}

const CustomDay: React.FC<CustomDayProps> = ({ day, modifiers, availableDatesMap, ...rest }) => {
  const dateObj = new Date(day.date);
  const shippingOption = availableDatesMap[dateObj.toDateString()];

  const className = `my-day ${modifiers.selected ? 'my-day-selected' : ''} ${
    modifiers.disabled ? 'my-day-disabled' : ''
  }`;

  return (
    <button {...rest} className={className}>
      <span className="my-day-date">{dateObj.getDate()}</span>
      {shippingOption && (
        <span className="my-day-price">
          <ShopperCurrency amount={shippingOption.cost} />
        </span>
      )}
    </button>
  );
};

const EMPTY_ARRAY: any[] = [];

const CalendarShippingOptions: React.FC<DeliveryDatePickerProps> = ({
  consignmentId,
  isLoading,
  shippingOptions = EMPTY_ARRAY,
  selectedShippingOptionId,
  onSelectedOption,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedShippingID, setSelectedShippingID] = useState<string | undefined>(undefined);

  const availableDatesMap = shippingOptions.reduce((map: any, option: any) => {
    const date = getDateFromDescription(option.description);

    if (date) {
      map[date.toDateString()] = option;
    }

    return map;
  }, {} as { [key: string]: ShippingOption });
  const availableDates = Object.keys(availableDatesMap).map((dateStr) => new Date(dateStr));

  const isDayAvailable = (date: Date) =>
    availableDates.some((availableDate) => availableDate.toDateString() === date.toDateString());

  const handleDaySelect = (date: Date | undefined) => {
    if (!date || !isDayAvailable(date)) return;
    setSelectedDate(date);

    const shippingOption = availableDatesMap[date.toDateString()];

    if (shippingOption) {
      onSelectedOption(consignmentId, shippingOption.id);
      setSelectedShippingID(shippingOption.id);
    }
  };

  useEffect(() => {
    if (selectedShippingOptionId && shippingOptions.length > 0 && !selectedDate) {
      const option = shippingOptions.find((o) => o.id === selectedShippingOptionId);

      if (option) {
        const date = getDateFromDescription(option.description);

        if (date) {
          setSelectedDate(date);
          setSelectedShippingID(option.id);
        }
      }
    }
  }, [selectedShippingOptionId, shippingOptions, selectedDate]);

  const footerContent =
    selectedDate && availableDatesMap[selectedDate.toDateString()] ? (
      <div className="dp-footer">
        <strong>Selected Delivery Date:</strong>{' '}
        <div>
          {format(selectedDate, 'eeee, d MMMM, yyyy')} —{' '}
          <ShopperCurrency amount={availableDatesMap[selectedDate.toDateString()].cost} />
        </div>
      </div>
    ) : (
      <div className="dp-footer">Please select a delivery date.</div>
    );

  return (
    <LoadingOverlay isLoading={isLoading}>
      <DayPicker
        components={{
          DayButton: (props) => <CustomDay {...props} availableDatesMap={availableDatesMap} />,
        }}
        fixedWeeks={true}
        footer={footerContent}
        mode="single"
        modifiers={{
          available: (date: Date) => isDayAvailable(date),
          disabled: (date: Date) => !isDayAvailable(date),
        }}
        onSelect={handleDaySelect}
        selected={selectedShippingOptionId === selectedShippingID ? selectedDate : undefined}
        showOutsideDays={true}
      />
    </LoadingOverlay>
  );
};

export default CalendarShippingOptions;
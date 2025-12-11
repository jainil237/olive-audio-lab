import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const RAZORPAY_SCRIPT_ID = 'razorpay-checkout-script';

const ensureRazorpayScript = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay requires a browser environment.'));
  }

  if (document.getElementById(RAZORPAY_SCRIPT_ID)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout.'));
    document.body.appendChild(script);
  });
};

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const StripeCheckoutForm = ({ amount, onClose, onSuccess, customer }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Payment service unavailable.');
      setProcessing(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      onSuccess({
        gateway: 'Stripe',
        amount,
        status: 'requires_capture',
        reference: `mock_stripe_payment_${Date.now()}`,
        customer,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      {error && <Alert severity="error">{error}</Alert>}
      <Button type="submit" variant="contained" disabled={!stripe || processing}>
        {processing ? 'Processing…' : `Pay $${amount.toFixed(2)} (Stripe)`}
      </Button>
    </Box>
  );
};


const PaymentDialog = ({ open, onClose, amount, onSuccess }) => {
  const [mode, setMode] = useState('stripe');
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [razorpayError, setRazorpayError] = useState(null);
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);

  useEffect(() => {
    if (mode !== 'razorpay') return;

    let cancelled = false;

    ensureRazorpayScript()
      .then(() => {
        if (cancelled) return;
        setIsRazorpayReady(true);
        setRazorpayError(null);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        setIsRazorpayReady(false);
        setRazorpayError('Failed to load payment processor. Please try again.');
      });

    return () => {
      cancelled = true;
    };
  }, [mode]);

  const handleRazorpay = () => {
    setRazorpayError(null);

    if (!isRazorpayReady || typeof window === 'undefined' || typeof window.Razorpay !== 'function') {
      setRazorpayError('Razorpay not available. Please refresh and try again.');
      return;
    }

    try {
      const rzpay = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
        amount: Math.round(amount * 100),
        currency: 'USD',
        name: 'Olive Audio Lab',
        description: 'Session Purchase',
        handler: (response) => {
          onSuccess({
            gateway: 'Razorpay',
            amount,
            status: 'captured',
            reference: response.razorpay_payment_id,
            customer: { name: customerName, email },
          });
          onClose();
        },
        prefill: { name: customerName, email },
        theme: { color: '#A3E635' },
      });
      rzpay.open();
      rzpay.on('payment.failed', (response) => {
        setRazorpayError(response?.error?.description || 'Payment failed. Please try again.');
      });
    } catch (error) {
      setRazorpayError(error?.message || 'Unknown Razorpay error');
    }
  };

  const disabled = !customerName || !email;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Complete payment</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Full name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              label="Payment Method"
            >
              <MenuItem value="stripe">Credit/Debit Card (Stripe)</MenuItem>
              <MenuItem value="razorpay">Razorpay</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Amount due
            </Typography>
          </Divider>
          
          <Typography variant="h4" align="center" fontWeight="bold">
            ${amount.toFixed(2)}
          </Typography>

          {mode === 'stripe' && stripePromise && (
            <Elements stripe={stripePromise}>
              <StripeCheckoutForm
                amount={amount}
                onClose={onClose}
                onSuccess={onSuccess}
                customer={{ name: customerName, email }}
              />
            </Elements>
          )}

          {mode === 'stripe' && !stripePromise && (
            <Alert severity="warning">
              Stripe is not properly configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in your environment variables.
            </Alert>
          )}

          {mode === 'razorpay' && razorpayError && (
            <Alert severity="error">{razorpayError}</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        
        {mode === 'razorpay' && (
          <Button
            variant="contained"
            disabled={disabled || !isRazorpayReady}
            onClick={handleRazorpay}
          >
            {isRazorpayReady ? `Pay $${amount.toFixed(2)}` : 'Loading...'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;

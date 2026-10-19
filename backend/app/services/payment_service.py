import uuid
from typing import Dict, Any

class PaymentService:
    @staticmethod
    def process_demo_payment(amount: float, method: str = "demo_upi", buyer_name: str = "") -> Dict[str, Any]:
        """
        Processes simulated agricultural payment with escrow hold.
        No actual credit card numbers are ever stored.
        """
        ref_id = f"TXN_{method.upper()}_{uuid.uuid4().hex[:10].upper()}"
        return {
            "success": True,
            "transaction_id": ref_id,
            "status": "held_in_escrow",
            "amount": amount,
            "currency": "INR",
            "method": method,
            "message": f"Demo Payment of ₹{amount:,.2f} authorized successfully. Funds secured in KrishiDirect Agricultural Escrow.",
            "is_simulated": True
        }

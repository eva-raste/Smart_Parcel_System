const express = require("express");
const {
  placeOrder,
  updateLocation,
  getOrdersForUser,
  getOrdersForAgent,
  orderAccept,
  rejectOrder,
  agentHistory,
  findOptimizedRoute,
    createOrder,
    verifyPayment,
    deliveredOrder,
} = require("../controllers/orderController");

const { requireSignIn } = require("../middlewares/authMiddleware");

const router = express.Router();


router.post("/agentSelect", requireSignIn, placeOrder);        
router.get("/userOrders", requireSignIn, getOrdersForUser); 
router.patch("/update-location/:id", requireSignIn, updateLocation);
router.get("/agent-orders", requireSignIn, (req, res, next) => {
    console.log("====== AGENT ORDERS ROUTE HIT ======");
    next();
}, getOrdersForAgent);
router.put("/:id/accept", requireSignIn, orderAccept);        
router.patch("/reject/:id", requireSignIn, rejectOrder);  
router.get("/agent-history", requireSignIn, agentHistory);      
router.patch("/mark-delivered/:id", requireSignIn, deliveredOrder);
router.post("/findpath", requireSignIn, findOptimizedRoute); 

router.post("/create-order", requireSignIn, createOrder);
router.post("/verify-payment", requireSignIn, verifyPayment);


module.exports = router;

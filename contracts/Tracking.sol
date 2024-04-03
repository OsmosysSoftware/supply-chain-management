// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Tracking {
    enum ShipmentStatus { PENDING, IN_TRANSIT, DELIVERED }

    struct Shipment {
        address sender;
        address receiver;
        uint256 pickupTime;
        uint256 deliveryTime;
        uint256 distance;
        uint256 price;
        ShipmentStatus status;
        bool isPaid;
    }

    mapping(address => Shipment[]) public shipments;
    
    event ShipmentCreated(address indexed sender, address indexed receiver, uint256 pickupTime, uint256 distance, uint256 price);
    event ShipmentInTransit(address indexed sender, address indexed receiver, uint256 pickupTime);
    event ShipmentDelivered(address indexed sender, address indexed receiver, uint256 deliveryTime);
    event ShipmentPaid(address indexed sender, address indexed receiver, uint256 amount);

    constructor() {}

    function createShipment(address _receiver, uint256 _pickupTime, uint256 _distance, uint256 _price) external payable {
        require(msg.value == _price, "Payment amount must match the price.");
        
        Shipment memory shipment = Shipment(msg.sender, _receiver, _pickupTime, 0, _distance, _price, ShipmentStatus.PENDING, false);
        shipments[msg.sender].push(shipment);
        
        emit ShipmentCreated(msg.sender, _receiver, _pickupTime, _distance, _price);
    }

    function startShipment(address _receiver, uint256 _index) external {
        Shipment storage shipment = shipments[msg.sender][_index];
        
        require(shipment.receiver == _receiver, "Invalid receiver.");
        require(shipment.status == ShipmentStatus.PENDING, "Shipment already in transit.");

        shipment.status = ShipmentStatus.IN_TRANSIT;

        emit ShipmentInTransit(shipment.sender, _receiver, shipment.pickupTime);
    }

    function completeShipment(address _receiver, uint256 _index) external {
        Shipment storage shipment = shipments[msg.sender][_index];

        require(shipment.receiver == _receiver, "Invalid receiver.");
        require(shipment.status == ShipmentStatus.IN_TRANSIT, "Shipment not in transit.");
        require(!shipment.isPaid, "Shipment already paid.");

        shipment.status = ShipmentStatus.DELIVERED;
        shipment.deliveryTime = block.timestamp;

        uint256 amount = shipment.price;

        payable(shipment.sender).transfer(amount);

        shipment.isPaid = true;

        emit ShipmentDelivered(shipment.sender, _receiver, shipment.deliveryTime);
        emit ShipmentPaid(shipment.sender, _receiver, amount);
    }

    function getShipment(address _sender, uint256 _index) external view returns (address, address, uint256, uint256, uint256, uint256, ShipmentStatus, bool) {
        Shipment memory shipment = shipments[_sender][_index];
        return (shipment.sender, shipment.receiver, shipment.pickupTime, shipment.deliveryTime, shipment.distance, shipment.price, shipment.status, shipment.isPaid);
    }

    function getShipmentsCount(address _sender) external view returns (uint256) {
        return shipments[_sender].length;
    }
}


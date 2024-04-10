# Product Tracking DApp API Documentation

## Table of Contents

- [Smart Contract API](#smart-contract-api)
  - [createShipment()](#createshipment)
  - [startShipment()](#startshipment)
  - [completeShipment()](#completeshipment)
  - [getShipment()](#getshipment)
  - [getShipmentsCount()](#getshipmentscount)
  - [getAllTransactionsForSender()](#getalltransactionsforsender)
  - [getAllTransactions()](#getalltransactions)
- [Frontend Services](#frontend-services)
  - [TrackingService](#trackingservice)
    - [createShipment()](#createshipment1)
    - [getAllShipment()](#getallshipment)
    - [getShipmentsCount()](#getshipmentscount1)
    - [getUserBalance()](#getuserbalance)
    - [completeShipment()](#completeshipment1)
    - [getShipment()](#getshipment1)
    - [startShipment()](#startshipment1)
  - [EthereumService](#ethereumservice)
    - [connectToMetaMaskWallet()](#connecttometamaskwallet)
    - [getSigner()](#getsigner)
    - [getBalance()](#getbalance)

## Smart Contract API

### `createShipment(address _receiver, uint256 _pickupTime, uint256 _distance, uint256 _price)`

- **Description:** Creates a new shipment record on the blockchain, associating it with the sender.
- **Parameters:**
  - `_receiver`: The address of the intended shipment recipient.
  - `_pickupTime`: The pickup time for the shipment (in Unix timestamp format).
  - `_distance`: The distance of the shipment.
  - `_price`: The agreed price of the shipment in Ether (ETH).
- **Events:**
  - `ShipmentCreated(address indexed sender, address indexed receiver, uint256 pickupTime, uint256 distance, uint256 price)`: Emmitted when a new shipment is successfully created.
- **Security:** The function requires that the `msg.value` (amount of ETH sent with the transaction) matches the provided `_price`. This prevents incorrect payment amounts.

### `startShipment(address _sender, address _receiver, uint256 _index)`

- **Description:** Marks a shipment as "in transit" on the blockchain.
- **Parameters:**
  - `_sender`: The address of the shipment's sender.
  - `_receiver`: The address of the shipment's receiver.
  - `_index`: The index of the shipment within the sender's shipments array.
- **Events:**
  - `ShipmentInTransit(address indexed sender, address indexed receiver, uint256 pickupTime)`: Emits when a shipment is started.
- **Security:** Ensures that only the correct sender and receiver are associated with the shipment, and that the shipment status is "PENDING" before transitioning it to "IN_TRANSIT".

### `completeShipment(address _sender, address _receiver, uint256 _index)`

- **Description:** Marks a shipment as delivered and transfers payment from the contract to the sender.
- **Parameters:**
  - `_sender`: The address of the shipment's sender.
  - `_receiver`: The address of the shipment's receiver.
  - `_index`: The index of the shipment within the sender's shipments array.
- **Events:**
  - `ShipmentDelivered(address indexed sender, address indexed receiver, uint256 deliveryTime)`: Emits when a shipment is completed.
  - `ShipmentPaid(address indexed sender, address indexed receiver, uint256 amount)`: Emits when the payment for the shipment is transferred to the sender.
- **Security:** Similar to `startShipment`, it has checks to protect the integrity of the shipment data.

### `getShipment(address _sender, uint256 _index)`

- **Description:** Retrieves information about a specific shipment.
- **Parameters:**
  - `_sender`: The address of the shipment's sender.
  - `_index`: The index of the shipment within the sender's shipments array.
- **Returns:**
  - `address sender`: Address of the sender.
  - `address receiver `: Address of the receiver.
  - `uint256 pickupTime`: Pickup time (Unix timestamp).
  - `uint256 deliveryTime`: Delivery time (Unix timestamp).
  - `uint256 distance`: Shipment distance.
  - `uint256 price`: Shipment price (ETH).
  - `ShipmentStatus status`: Status of the shipment (PENDING, IN_TRANSIT, DELIVERED).
  - `bool isPaid`: Indicates if the shipment has been paid for.

### `getShipmentsCount(address _sender)`

- **Description:** Gets the number of shipments associated with a sender.
- **Parameters:**
  - `_sender`: Address of the sender.
- **Returns:**
  - `uint256`: Total number of shipments for the sender.

### `getAllTransactionsForSender(address _sender)`

- **Description:** Retrieves an array of shipment records associated with a specific sender address.
- **Parameters:**
  - `_sender`: The address of the sender.
- **Returns:**
  - `Shipment[]`: An array of `Shipment` objects representing all shipments associated with the sender.

### `getAllTransactions()`

- **Description:** Retrieves an array of all shipment records stored in the contract.
- **Returns:**
  - `TypeShipment[]`: An array of `TypeShipment` objects representing all shipments.

## Frontend Services

### TrackingService

#### `createShipment(items: ShipmentData)`

- **Description:** Calls the smart contract's `createShipment` function to initiate a new shipment.
- **Parameters:**
  - `items`: A `ShipmentData` object containing:
    - `sender`: The address of the sender.
    - `receiver`: The address of the receiver.
    - `price`: The shipment price in Ether (ETH).
    - `pickupTime`: The pickup time (Date object or Unix timestamp).
    - `distance`: Shipment distance.
- **Returns:** Likely `void` (you may want to emit a custom Angular event on successful transaction for reactivity).

#### `getAllShipment(): Promise<any[]>`

- **Description:** Fetches all shipment records from the blockchain using the contract's `getAllTransactions`. Formats the raw data.
- **Returns:** A promise resolving to an array of formatted shipment objects.

#### `getShipmentsCount(): Promise<number>`

- **Description:** Retrieves the number of shipments associated with the current user's address using the contract's `getShipmentsCount`.
- **Returns:** A promise resolving to a number representing the shipment count.

#### `getUserBalance(): Promise<string>`

- **Description:** Fetches the current user's Ethereum balance.
- **Returns:** A promise resolving to a string representing the balance in Ether (ETH).

#### `completeShipment(receiver: string, index: number)`

- **Description:** Calls the contract's `completeShipment` function to mark a shipment as delivered.
- **Parameters:**
  - `receiver`: The address of the shipment's receiver.
  - `index`: The index of the shipment within the sender

's shipments array.
- **Returns:** Likely `void` (with an Angular event on successful completion).

#### `getShipment(index: number): Promise<ShipmentData | undefined>`

- **Description:** Calls the contract's `getShipment` function to get details of a specific shipment.
- **Parameters:**
  - `index`: The index of the shipment within the sender's shipments array.
- **Returns:** A promise resolving to a `ShipmentData` object (or `undefined` if not found).

#### `startShipment(receiver: string, index: number)`

- **Description:** Calls the contract's `startShipment` function to mark a shipment as in transit.
- **Parameters:**
  - `receiver`: The address of the shipment's receiver.
  - `index`: The index of the shipment within the sender's shipments array.
- **Returns:** Likely `void` (with an Angular event on successful transaction).

### EthereumService

#### `connectToMetaMaskWallet()`

- **Description:** Prompts the user to connect their MetaMask wallet and initializes the Web3 provider.

#### `getSigner()`

- **Description:** Retrieves the current `ethers.JsonRpcSigner` object for interacting with the blockchain.

#### `getBalance()`

- **Description:** Gets the Ethereum balance for a given address.

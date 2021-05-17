pragma solidity ^0.5.0;

contract HashPuppies {
    string public name;
    uint256 public puppiesCount = 0;

    mapping(uint256 => Puppy) public puppies;

    struct Puppy {
        uint256 id;
        string name;
        uint256 price;
        address payable owner;
        bool purchased;
    }

    constructor() public {
        name = "HashPuppies";
    }

    event PuppyPurchased(
        uint256 id,
        string name,
        uint256 price,
        address payable owner,
        bool purchased
    );

    event PuppyCreated(
        uint256 id,
        string name,
        uint256 price,
        address payable owner,
        bool purchased
    );

    function createPuppy(string memory _name, uint256 _price) public {
        // Make sure parameters are correct
        require(bytes(_name).length > 0);
        require(_price > 0);
        // Increment puppy count
        puppiesCount++;
        // Create the puppy
        puppies[puppiesCount] = Puppy(
            puppiesCount,
            _name,
            _price,
            msg.sender,
            false
        );
        // Trigger an event
        emit PuppyCreated(puppiesCount, _name, _price, msg.sender, false);
    }

    function purchasePuppy(uint256 _id) public payable {
        // Fetch the puppy
        Puppy memory _puppy = puppies[_id];
        // Make sure the puppy is valid
        require(_puppy.id > 0 && _puppy.id <= puppiesCount);
        // Require that there is enough ether in the transaction
        require(msg.value >= _puppy.price);
        // Require that the product has not been purchased already
        require(!_puppy.purchased);
        // Fetch the owner
        address payable _seller = _puppy.owner;
        // Require that buyer is not the seller
        require(_seller != msg.sender);
        // Transfer ownership to buyer
        _puppy.owner = msg.sender;
        // Mark as purchased
        _puppy.purchased = true;
        // Update the puppy
        puppies[_id] = _puppy;
        // Pay the seller by sending ether
        address(_seller).transfer(msg.value);
        // Trigger an event
        emit PuppyPurchased(
            puppiesCount,
            _puppy.name,
            _puppy.price,
            msg.sender,
            true
        );
    }
}

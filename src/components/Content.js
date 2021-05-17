import React, { Component } from 'react';

class Content extends Component {
    render() {
        return (
            <div id="content">
                <h1>Add a Puppy</h1>
                <form onSubmit={(event) => {
                    event.preventDefault();
                    const name = this.puppyName.value;
                    const price = window.web3.utils.toWei(this.puppyPrice.value.toString(), 'Ether');
                    this.props.createPuppy(name, price);
                }}>
                    <div className="form-group mr-sm-2">
                        <input
                            id="productName"
                            type="text"
                            ref={(input) => { this.puppyName = input }}
                            className="form-control"
                            placeholder="Product Name"
                            required />
                    </div>
                    <div className="form-group mr-sm-2">
                        <input
                            id="productPrice"
                            type="text"
                            ref={(input) => { this.puppyPrice = input }}
                            className="form-control"
                            placeholder="Product Price"
                            required />
                    </div>
                    <button type="submit" className="btn btn-primary">Add Puppy</button>
                </form>
                <p>&nbsp;</p>
                <h2>Buy a Puppy</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Price</th>
                            <th scope="col">Owner</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody id="productList">
                        {this.props.puppies.map((puppy, key) => {
                            return (
                                <tr key={key}>
                                    <th scope="row">{puppy.id.toString()}</th>
                                    <td>{puppy.name}</td>
                                    <td>{window.web3.utils.fromWei(puppy.price.toString(), 'Ether')} Eth</td>
                                    <td>{puppy.owner}</td>
                                    <td>
                                        {!puppy.purchased
                                            ?
                                            < button
                                                name={puppy.id}
                                                value={puppy.price}
                                                onClick={(event) => {
                                                    this.props.purchasePuppy(event.target.name, event.target.value);
                                                }}
                                                className="buyButton btn btn-sm btn-success"
                                            >
                                                Buy
                                            </button>
                                            : null
                                        }
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div >
        );
    }
}

export default Content;

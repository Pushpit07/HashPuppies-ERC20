import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import HashPuppies from '../abis/HashPuppies.json';
import Content from './Content';

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			account: '',
			puppiesCount: 0,
			puppies: [],
			hashPuppies: '',
			loading: true
		};
		this.createPuppy = this.createPuppy.bind(this);
		this.purchasePuppy = this.purchasePuppy.bind(this);
	}

	async componentWillMount() {
		await this.loadWeb3();
		await this.loadBlockchainData();
	}

	async loadWeb3() {
		if (window.ethereum) {
			window.web3 = new Web3(window.ethereum);
			await window.ethereum.enable();
		}
		else if (window.web3) {
			window.web3 = new Web3(window.web3.currentProvider);
		}
		else {
			window.alert("Non-Ethereum browser detected. You should consider trying Metamask");
		}
	}

	async loadBlockchainData() {
		const web3 = window.web3;
		// Load account
		const accounts = await web3.eth.getAccounts();
		this.setState({ account: accounts[0] });

		const networkId = await web3.eth.net.getId();
		const networkData = HashPuppies.networks[networkId];

		if (networkData) {
			const hashPuppies = web3.eth.Contract(HashPuppies.abi, networkData.address);
			this.setState({ hashPuppies });
			const puppiesCount = await hashPuppies.methods.puppiesCount().call();
			this.setState({ puppiesCount });
			// Load Puppies
			for (var i = 1; i <= puppiesCount; i++) {
				const puppy = await hashPuppies.methods.puppies(i).call();
				this.setState({ puppies: [...this.state.puppies, puppy] });
			}
			this.setState({ loading: false });
		} else {
			window.alert('HashPuppies Contract not deployed to detected network!');
		}
	}

	createPuppy(name, price) {
		this.setState({ loading: true });
		this.state.hashPuppies.methods.createPuppy(name, price).send({ from: this.state.account })
			.once('receipt', (receipt) => {
				this.setState({ loading: false });
			});
	}

	purchasePuppy(id, price) {
		this.setState({ loading: true });
		this.state.hashPuppies.methods.purchasePuppy(id).send({ from: this.state.account, value: price })
			.once('receipt', (receipt) => {
				this.setState({ loading: false });
			});
	}

	render() {
		return (
			<div>
				<div className="container-fluid mt-5">
					<div className="row">
						<main role="main" className="col-lg-12 d-flex">
							{this.state.loading
								? <div id="loader" className="text-center"><p className="text-center"></p>Loading...</div>
								: <Content
									createPuppy={this.createPuppy}
									purchasePuppy={this.purchasePuppy}
									puppies={this.state.puppies}
								/>
							}
						</main>
					</div>
				</div>
			</div >
		);
	}
}

export default App;

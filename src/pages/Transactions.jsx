import { useEffect, useState } from 'react';
import axios from 'axios';

// Configure axios
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = true;
import { CashStack, ArrowLeftRight, WalletFill, Wallet2, ClockHistory, ArrowLeft, CheckCircleFill } from 'react-bootstrap-icons';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [activeView, setActiveView] = useState('accounts');
  const [activeAccount, setActiveAccount] = useState(null);
  const [activeOperation, setActiveOperation] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredTransaction, setHoveredTransaction] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    toAccount: '',
    recipientName: '',
    recipientAccountNumber: ''
  });
  const [accountBalances, setAccountBalances] = useState({
    current: 0,
    savings: 0
  });

  const styles = {
    container: {
      backgroundColor: '#1A2526',
      minHeight: 'calc(100vh - 60px)',
      marginLeft: window.innerWidth < 768 ? '0' : '170px',
      paddingTop: '60px',
      overflowY: 'auto',
      boxSizing: 'border-box',
      width: window.innerWidth < 768 ? '100%' : 'calc(100% - 150px)',
      position: 'relative',
      padding: '1.5rem'
    },
    accountCard: {
      backgroundColor: '#2A3B3C',
      border: 'none',
      borderRadius: '15px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      padding: '15px',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    accountCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
    },
    transactionCard: {
      backgroundColor: '#2A3B3C',
      border: 'none',
      borderRadius: '15px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      marginBottom: '1rem'
    },
    formContainer: {
      backgroundColor: '#1A2526',
      borderRadius: '15px',
      padding: '1.5rem'
    },
    input: {
      backgroundColor: '#2A3B3C',
      border: '1px solid #3A4B4C',
      color: 'white',
      borderRadius: '8px'
    },
    button: {
      backgroundColor: '#00C4B4',
      border: 'none',
      borderRadius: '8px',
      padding: '0.5rem 1.5rem',
      color: 'white',
      transition: 'background-color 0.2s'
    },
    buttonHover: {
      backgroundColor: '#00A89A'
    },
    transactionItem: {
      transition: 'background-color 0.2s',
      padding: '1rem',
      borderLeft: '4px solid transparent',
      width: '100%',
      overflowX: 'hidden'
    },
    transactionItemHover: {
      backgroundColor: '#2A3B3C'
    },
    transactionAmount: {
      wordBreak: 'break-word',
      textAlign: 'right',
      minWidth: '100px'
    },
    currentAccountCard: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    },
    accountNumber: {
      fontSize: '16px',
      color: '#666',
      marginBottom: '8px'
    },
    balanceSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    balanceLabel: {
      fontSize: '16px',
      color: '#666',
      marginBottom: '4px'
    },
    balanceAmount: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333'
    },
    transactionHistory: {
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    },
    transactionHeader: {
      padding: '20px',
      borderBottom: '1px solid #e0e0e0'
    }
  };

  const fetchAccountBalances = async () => {
    try {
      console.log('Fetching account balances...');
      const response = await axios.get('http://localhost:8080/api/dashboard');
      console.log('Received balances:', response.data);
      setAccountBalances({
        current: response.data.currentBalance,
        savings: response.data.savingsBalance
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Fetch balances when component mounts
  useEffect(() => {
    console.log('Component mounted, fetching initial balances...');
    fetchAccountBalances();
  }, []);

  // Fetch transactions when component mounts
  useEffect(() => {
    console.log('Component mounted, fetching initial transactions...');
    fetchTransactions();
  }, []);

  // Fetch transactions when activeView changes
  useEffect(() => {
    if (activeView === 'transactions') {
      console.log('Active view is transactions, fetching...');
      fetchTransactions();
    }
  }, [activeView]);

  // Reset form when operation changes
  useEffect(() => {
    setFormData({
      amount: '',
      description: '',
      toAccount: '',
      recipientName: '',
      recipientAccountNumber: ''
    });
    setSuccessMessage('');
  }, [activeOperation]);

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions...');
      const response = await axios.get('http://localhost:8080/api/transactions');
      console.log('Received transactions:', response.data);
      setTransactions(response.data);
      setShowTransactions(true);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let endpoint;
      let payload;

      if (activeOperation === 'pay') {
        endpoint = '/api/transactions/pay';
        payload = {
          accountType: activeAccount,
          type: 'debit',
          amount: parseFloat(formData.amount),
          description: formData.description,
          recipientName: formData.recipientName,
          recipientAccountNumber: formData.recipientAccountNumber
        };
      } else if (activeOperation === 'transfer') {
        endpoint = '/api/transactions/transfer';
        payload = {
          accountType: activeAccount,
          type: 'transfer',
          amount: parseFloat(formData.amount),
          description: formData.description,
          toAccount: formData.toAccount
        };
      } else if (activeOperation === 'deposit') {
        endpoint = '/api/transactions/deposit';
        payload = {
          accountType: activeAccount,
          type: 'deposit',
          amount: parseFloat(formData.amount),
          description: formData.description || 'Deposit'
        };
      }

      console.log('Sending request:', { endpoint, payload });
      const response = await axios.post(`http://localhost:8080${endpoint}`, payload);
      console.log('Received response:', response.data);

      if (response.data) {
        // Get the new balance from the response
        const newBalance = response.data.balance;
        console.log('New balance from response:', newBalance);
        
        // Update the account balances
        setAccountBalances(prev => {
          const updated = {
            ...prev,
            [activeAccount]: newBalance
          };
          console.log('Updated account balances:', updated);
          return updated;
        });

        // Fetch latest balances from dashboard
        await fetchAccountBalances();
        
        // Show success message with amount
        const message = activeOperation === 'deposit' 
          ? `Successfully deposited ${formatAmount(payload.amount)}. New balance: ${formatAmount(newBalance)}`
          : `${activeOperation === 'pay' ? 'Payment' : 'Transfer'} successful!`;
        
        setSuccessMessage(message);
        
        // Clear form
        setFormData({
          amount: '',
          description: '',
          toAccount: '',
          recipientName: '',
          recipientAccountNumber: ''
        });

        // Refresh transactions immediately
        console.log('Transaction successful, refreshing history...');
        await fetchTransactions();

        // Go back to transactions view after success
        setActiveView('transactions');
        setShowTransactions(true);

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'toAccount') {
      // Set recipient account number based on selected account
      const recipientAccountNumber = value === 'current' ? '1234567890' : value === 'savings' ? '9876543210' : '';
      setFormData(prev => ({
        ...prev,
        [name]: value,
        recipientAccountNumber
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return 'R0.00';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderTransactionHistory = () => {
    if (!showTransactions) return null;

    const filteredTransactions = transactions.filter(t => t.accountType === activeAccount);

    return (
      <div style={styles.transactionHistory}>
        <div style={styles.currentAccountCard}>
          <h3>Current Account</h3>
          <p style={styles.accountNumber}>**** 7890</p>
          <div style={styles.balanceSection}>
            <p style={styles.balanceLabel}>Available Balance</p>
            <p style={styles.balanceAmount}>{formatAmount(accountBalances.current)}</p>
          </div>
        </div>
        <div style={styles.transactionHeader}>
          <h2>Transaction History</h2>
        </div>
        {filteredTransactions.length === 0 ? (
          <p className="text-muted text-center mb-0">No transactions yet</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => {
                  const isDeposit = transaction.type === 'deposit';
                  const isCredit = transaction.type === 'credit';
                  const isDebit = transaction.type === 'debit';
                  const isTransferOut = transaction.type === 'transfer';
                  
                  let amountColor = 'text-muted';
                  let amountPrefix = '';
                  
                  if (isDeposit || isCredit) {
                    amountColor = 'text-success';
                    amountPrefix = '+';
                  } else if (isDebit || isTransferOut) {
                    amountColor = 'text-danger';
                    amountPrefix = '-';
                  }

                  return (
                    <tr key={index}>
                      <td>{transaction.date}</td>
                      <td>
                        {transaction.description}
                        {transaction.recipientName && (
                          <small className="text-muted d-block">
                            To: {transaction.recipientName}
                            {transaction.recipientAccountNumber && ` (${transaction.recipientAccountNumber})`}
                          </small>
                        )}
                        {transaction.toAccount && (
                          <small className="text-muted d-block">
                            To: {transaction.toAccount === 'current' ? 'Current Account' : 'Savings Account'}
                          </small>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${
                          isDeposit ? 'bg-success' :
                          isCredit ? 'bg-success' :
                          isDebit ? 'bg-danger' :
                          'bg-primary'
                        }`}>
                          {isDeposit ? 'Money In' :
                           isCredit ? 'Received' :
                           isDebit ? 'Payment' :
                           'Transfer'}
                        </span>
                      </td>
                      <td className={`text-end ${amountColor}`}>
                        {amountPrefix}{formatAmount(transaction.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderAccountsView = () => {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Account Overview</h2>
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div style={styles.accountCard}>
                    <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Current Account</h3>
                    <p style={{ color: '#aaa', marginBottom: '0.5rem' }}>**** 7890</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#aaa' }}>Available Balance</span>
                      <span style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {formatAmount(accountBalances.current)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div style={styles.accountCard}>
                    <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Savings Account</h3>
                    <p style={{ color: '#aaa', marginBottom: '0.5rem' }}>**** 3210</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#aaa' }}>Available Balance</span>
                      <span style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {formatAmount(accountBalances.savings)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Quick Actions</h3>
            <div className="row">
              <div className="col-md-4 mb-3">
                <button
                  className="btn w-100"
                  style={{
                    ...styles.accountCard,
                    textAlign: 'left',
                    border: 'none',
                    height: '100%',
                    minHeight: '120px'
                  }}
                  onClick={() => {
                    setActiveAccount('current');
                    setActiveOperation('deposit');
                    setActiveView('operations-deposit');
                  }}
                >
                  <CashStack size={24} color="#00C4B4" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Deposit</h4>
                  <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: 0 }}>
                    Add money to your account
                  </p>
                </button>
              </div>
              <div className="col-md-4 mb-3">
                <button
                  className="btn w-100"
                  style={{
                    ...styles.accountCard,
                    textAlign: 'left',
                    border: 'none',
                    height: '100%',
                    minHeight: '120px'
                  }}
                  onClick={() => {
                    setActiveAccount('current');
                    setActiveOperation('transfer');
                    setActiveView('operations-transfer');
                  }}
                >
                  <ArrowLeftRight size={24} color="#00C4B4" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Transfer</h4>
                  <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: 0 }}>
                    Move money between accounts
                  </p>
                </button>
              </div>
              <div className="col-md-4 mb-3">
                <button
                  className="btn w-100"
                  style={{
                    ...styles.accountCard,
                    textAlign: 'left',
                    border: 'none',
                    height: '100%',
                    minHeight: '120px'
                  }}
                  onClick={() => {
                    setActiveAccount('current');
                    setActiveOperation('pay');
                    setActiveView('operations-pay');
                  }}
                >
                  <WalletFill size={24} color="#00C4B4" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Pay</h4>
                  <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: 0 }}>
                    Send money to someone
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTransactionsView = () => {
    const isCurrentAccount = activeAccount === 'current';
    const accountColor = isCurrentAccount ? 'primary' : 'success';
    const accountIcon = isCurrentAccount ? <WalletFill size={24} /> : <Wallet2 size={24} />;
    const accountName = isCurrentAccount ? 'Current Account' : 'Savings Account';

    return (
      <div style={styles.container}>
        <div className="card">
          <div className={`card-header bg-${accountColor} text-white`}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <button 
                  className="btn btn-link text-white p-0"
                  onClick={() => {
                    setActiveView('accounts');
                    setShowTransactions(false);
                    setActiveAccount(null);
                    setActiveOperation(null);
                    setFormData({
                      amount: '',
                      description: '',
                      toAccount: '',
                      recipientName: '',
                      recipientAccountNumber: ''
                    });
                    setSuccessMessage('');
                  }}
                >
                  ← Back
                </button>
                <div className="d-flex align-items-center">
                  {accountIcon}
                  <h5 className="mb-0 ms-2">{accountName}</h5>
                </div>
              </div>
              <div>
                <h5 className="mb-0">Available: {formatAmount(accountBalances[activeAccount])}</h5>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="row g-4">
              <div className="col-md-6">
                <div className="card h-100" 
                  style={{
                    ...styles.accountCard,
                    ...(hoveredCard === 'pay' ? styles.accountCardHover : {})
                  }}
                  onMouseEnter={() => setHoveredCard('pay')}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => {
                    setActiveOperation('pay');
                    setActiveView(`${activeAccount}-operations`);
                  }}
                >
                  <div className="card-body d-flex flex-column align-items-center justify-content-center text-center text-white">
                    <CashStack size={48} className="text-#00C4B4 mb-3" />
                    <h3 className="card-title mb-3">Pay</h3>
                    <p className="card-text text-muted">Make a payment from your {accountName.toLowerCase()}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card h-100"
                  style={{
                    ...styles.accountCard,
                    ...(hoveredCard === 'transfer' ? styles.accountCardHover : {})
                  }}
                  onMouseEnter={() => setHoveredCard('transfer')}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => {
                    setActiveOperation('transfer');
                    setActiveView(`${activeAccount}-operations`);
                  }}
                >
                  <div className="card-body d-flex flex-column align-items-center justify-content-center text-center text-white">
                    <ArrowLeftRight size={48} className="text-#00C4B4 mb-3" />
                    <h3 className="card-title mb-3">Transfer</h3>
                    <p className="card-text text-muted">Transfer money between your accounts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {renderTransactionHistory()}
      </div>
    );
  };

  const renderOperationsView = () => {
    const isCurrentAccount = activeAccount === 'current';
    const accountColor = isCurrentAccount ? 'primary' : 'success';
    const accountIcon = isCurrentAccount ? <WalletFill size={24} /> : <Wallet2 size={24} />;
    const accountName = isCurrentAccount ? 'Current Account' : 'Savings Account';

    return (
      <div style={styles.formContainer}>
        <div className="card" style={styles.transactionCard}>
          <div className={`card-header bg-${accountColor} text-white`}>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <button 
                  className="btn btn-link text-white p-0 me-3"
                  onClick={() => {
                    setActiveView('transactions');
                    setActiveOperation(null);
                    setFormData({
                      amount: '',
                      description: '',
                      toAccount: '',
                      recipientName: '',
                      recipientAccountNumber: ''
                    });
                    setSuccessMessage('');
                  }}
                >
                  ← Back
                </button>
                <div className="d-flex align-items-center">
                  {accountIcon}
                  <h5 className="mb-0 ms-2">{accountName}</h5>
                </div>
              </div>
              <div>
                <h5 className="mb-0">Available: {formatAmount(accountBalances[activeAccount])}</h5>
              </div>
            </div>
          </div>
          <div className="card-body">
            <h3 className="text-white mb-4">
              {activeOperation === 'pay' ? 'Make a Payment' : 
               activeOperation === 'transfer' ? 'Transfer Money' :
               'Make a Deposit'}
            </h3>
            {successMessage && (
              <div className="alert alert-success mb-4">
                <div className="d-flex align-items-center">
                  <CheckCircleFill className="me-2" />
                  {successMessage}
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {activeOperation === 'transfer' ? (
                <div className="mb-3">
                  <label className="form-label">To Account</label>
                  <select
                    className="form-select form-select-lg"
                    name="toAccount"
                    value={formData.toAccount}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                  >
                    <option value="">Select account</option>
                    {activeAccount === 'current' ? (
                      <option value="savings">Savings Account</option>
                    ) : (
                      <option value="current">Current Account</option>
                    )}
                  </select>
                </div>
              ) : activeOperation === 'pay' ? (
                <>
                  <div className="mb-3">
                    <label className="form-label">Recipient Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter recipient's name"
                      style={styles.input}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Recipient Account Number</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="recipientAccountNumber"
                      value={formData.recipientAccountNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter recipient's account number"
                      pattern="[0-9]*"
                      minLength="10"
                      maxLength="10"
                      style={styles.input}
                    />
                  </div>
                </>
              ) : null}
              <div className="mb-3">
                <label className="form-label">Amount</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">R</span>
                  <input
                    type="number"
                    className="form-control"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    style={styles.input}
                  />
                </div>
                {activeOperation === 'deposit' && (
                  <div className="form-text text-white-50 mt-2">
                    Current balance: {formatAmount(accountBalances.current)}
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required={activeOperation !== 'deposit'}
                  placeholder={activeOperation === 'deposit' ? 'Optional description' : 'Enter description'}
                  style={styles.input}
                />
              </div>
              <button
                type="submit"
                className="btn btn-lg w-100"
                style={{ ...styles.button, backgroundColor: '#00C4B4' }}
              >
                {activeOperation === 'pay' ? 'Make Payment' : 
                 activeOperation === 'transfer' ? 'Transfer Money' :
                 'Make Deposit'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {activeView === 'accounts' && renderAccountsView()}
      {activeView.includes('operations') && (
        <div className="row">
          <div className="col-12 col-lg-6 mb-4">
            {renderOperationsView()}
          </div>
          <div className="col-12 col-lg-6">
            {renderTransactionHistory()}
          </div>
        </div>
      )}
      {activeView === 'transactions' && renderTransactionsView()}
    </div>
  );
}

export default Transactions;
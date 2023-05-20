import tensorflow as tf

#description Reccurent neural network implementations: LSTM, GRU
#icon glyphicon glyphicon-link

#param list:GRU, LSTM
type="GRU"
#param int
n_classes = 2
#param array|int
hidden_units = [32]
#param bool
advanced = False
#zone advanced==True
#param int
dropout=0.75
#param array|int
reshape = [-1]
#endzone

self.name = self.name.replace(" ", "_")

self.variables = []

def Run(self, graph, reuse=False):
	Log(graph.get_shape())

	if len(self.reshape)<=1:
		graph = tf.reshape(graph, [-1, int(graph.get_shape()[1]), 1])
	else:
		graph = tf.reshape(graph, self.reshape)
	
	if self.type=="GRU":
		cells = []
		for cell_n_hidden in self.hidden_units:
			t_cell = tf.nn.rnn_cell.GRUCell(cell_n_hidden)
			t_cell = tf.nn.rnn_cell.DropoutWrapper(t_cell, output_keep_prob=self.dropout)
			cells.append(t_cell)
		cell = tf.nn.rnn_cell.MultiRNNCell(cells)
			
		with tf.variable_scope(self.name, reuse=reuse):
			val, self.state = tf.nn.dynamic_rnn(cell, graph, dtype=tf.float32)
		
		val = tf.transpose(val, [1, 0, 2])
		last = tf.gather(val, int(val.get_shape()[0]) - 1)
		self.weightV = tf.Variable(tf.truncated_normal([self.hidden_units[len(self.hidden_units)-1], self.n_classes]), name=self.name+"_W")
		self.biasV = tf.Variable(tf.constant(0.1, shape=[self.n_classes]), name=self.name+"_b")
		obj = tf.matmul(last, self.weightV) + self.biasV

		self.variables.append(self.weightV)
		self.variables.append(self.biasV)

		Log(self.name+": "+str(self.hidden_units)+" => "+str(obj.get_shape()))

		return obj
	else:
		cells = []
		for cell_n_hidden in self.hidden_units:
			t_cell = tf.nn.rnn_cell.LSTMCell(cell_n_hidden, state_is_tuple=True)
			t_cell = tf.nn.rnn_cell.DropoutWrapper(t_cell, output_keep_prob=self.dropout)
			cells.append(t_cell)
		cell = tf.nn.rnn_cell.MultiRNNCell(cells)
		
		with tf.variable_scope(self.name, reuse=reuse):
		  val, _ = tf.nn.dynamic_rnn(cell, graph, dtype=tf.float32)

		val = tf.transpose(val, [1, 0, 2])
		last = tf.gather(val, int(val.get_shape()[0]) - 1)
		self.weightV = tf.Variable(tf.truncated_normal([self.hidden_units[len(self.hidden_units)-1], self.n_classes]), name=self.name+"_W")
		self.biasV = tf.Variable(tf.constant(0.1, shape=[self.n_classes]), name=self.name+"_b")
		obj = tf.matmul(last, self.weightV) + self.biasV

		self.variables.append(self.weightV)
		self.variables.append(self.biasV)

		Log(self.name+": "+str(self.hidden_units)+" => "+str(obj.get_shape()))

		return obj

def getVariables(self):
	return self.variables
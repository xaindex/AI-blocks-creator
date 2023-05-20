import numpy as np
from keras.models import load_model
from keras import backend as K

#description Keras Classifier script
#icon fa fa-magic
#MAIN=Run

#param object
_input = None
#param object
model = None
#param int
epochs = 1000
#param int
display_step = 5
#param list:raw tensor,image,sound,
_type = "raw tensor"
#param folder
save_path = ""
#param file
load_file = ""
#param float
force_lr = -1

def Run(self):
    if self.load_file!="":
        _model = load_model(self.load_file)
    else:
        self.model.Run()
        _model = self.model.instance

    for it in range(self.epochs):
        batch = self._input.getNextBatch()

        X_batch  = np.asarray(batch[0])
        Y_batch  = np.asarray(batch[1])
        
        X_batch = np.reshape(X_batch, [self._input.batch_size] + self.model.input_shape)
        
        if(self.force_lr>0):
            K.set_value(_model.optimizer.lr, self.force_lr)  # set new lr

        infos = _model.train_on_batch(X_batch, Y_batch)
        SetState(self.id, it/self.epochs)

		#every N steps, send the state to the scene
        if it % self.display_step == 0:
            SendChartData(self.id, "Loss", infos[0], "#ff0000")
            Log("Loss: "+str(infos[0]))
            if self._type=="image":
                test_X = [X_batch[0]]
                test_Y = [Y_batch[0]]
                rebuilt_image = _model.predict(np.asarray(test_X))
                rebuilt_image = np.reshape(rebuilt_image, [1, 1024])[0]
                test_X = np.reshape(X_batch[0], [1, 1024])[0].tolist()
                SendImageData(self.id, test_X, self._input.image_width, self._input.image_width, "original")
                SendImageData(self.id, test_Y[0], self._input.image_width, self._input.image_width, "depth")
                SendImageData(self.id, rebuilt_image, self._input.image_width, self._input.image_width, "fake")
        
    if(self.save_path):
        _model.save(self.save_path+'/model.h5')  # creates a HDF5 file 'my_model.h5'
        

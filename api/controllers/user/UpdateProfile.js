import cloudinary from '../../config/cloudinary.js';
import user from '../../models/user.js';
import users from '../../models/user.js'
export default async function UpdateProfile(req, res) {
   const { user } = req;
   console.log(user, 'Requested profile Update !');
   console.log('cloudinary Url :', req.file);

   try {
      const userdata = await users.findById(user.id);
      if (!userdata) return res.status(400).json({ err: 'invalid Request' });

      if (userdata.profile.cloudId) { /// remove old profile from cloud
         await cloudinary.uploader.destroy(userdata.profile.cloudId);

      }

      /// update new proflie in database
      userdata.profile = {
         url: req.file.cloudinaryUrl,
         cloudId: req.file.cloud_id
      }
      await userdata.save();

      // return new profile to user
      const userData = {
         email:userdata.email,
         username:userdata.username,
         profile: userdata.profile.url
      }


      return res.status(200).json({ success: true, user: userData, msg: 'Profile uploaded successfully' });

   } catch (error) {
      console.log(error)
      return res.status(500).json({ err: 'Unexpected Error' });
   }
}
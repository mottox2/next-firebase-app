import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/functions'

import { Spinner, Button } from 'sancho'
import Layout from '../../components/Layout'
import { withRouter } from 'next/router'
import { useContext, useState, useEffect } from 'react'
import UserContext from '../../contexts/UserContext';
import router from 'next/router'

const Join: React.FC<{
  router: any
}> = (props) => {
  const { user, isUserLoading, userData, reloadUser } = useContext(UserContext)
  const [isProcessing, setProcessing] = useState(false)
  const { circleId, token } = props.router.query

  const handleClick = async () => {
    setProcessing(true)
    const receiveInvitation = firebase.functions().httpsCallable('receiveInvitation')
    const result = await receiveInvitation({ circleId, token })
    // TODO: メッセージの表示
    console.log(result)
    await reloadUser()
    setProcessing(false)
    router.push('/mypage')
  }

  if (!circleId || !token) {
    return <Layout><p>無効な招待URLです</p></Layout>
  }

  if (isUserLoading || (user && !userData)) {
    return <Spinner label="Loading..." center />
  }

  if (!user) {
    return <Layout>
      <p>サークルへの参加にはログインしてください</p>
      <Button onClick={() => {
        const provider = new firebase.auth.GoogleAuthProvider()
        firebase.auth().signInWithPopup(provider).then(function (result) {
          console.log(result)
        })
      }}>
        Login
      </Button>
    </Layout>
  }

  return (
    <Layout tab={props.router.query.tab}>
      <Button loading={isProcessing} onClick={handleClick}>サークルに参加する</Button>
    </Layout >
  )
}

export default withRouter(Join)
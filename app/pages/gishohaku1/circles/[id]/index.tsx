/** @jsx jsx */
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/functions'

import { jsx } from '@emotion/core'
import { useContext } from 'react';
import { withRouter, NextRouter } from 'next/router';

import { initFirebase } from '../../../../utils/firebase'
import Circle from '../../../../utils/circle'
import Book, { refToId } from '../../../../utils/book'
import CircleDetail from '../../../../components/CircleDetail'
import SEO from '../../../../components/SEO'
import { NextPage } from 'next'
import CircleSelect from '../../../../components/CircleSelect';
import UserContext from '../../../../contexts/UserContext';
import EventContext from '../../../../contexts/EventContext';
import StarsContext from '../../../../contexts/StarsContext';

interface Props {
  circle: Circle
  books: Book[]
}

const CirclePage: NextPage<Props & { router: NextRouter }, Props> = props => {
  const { eventId } = useContext(EventContext)
  const { userStars } = useContext(StarsContext)
  const { circle, books, router } = props
  return (
    <>
      <SEO title={circle.name} imageUrl={circle.image} />
      <CircleSelect circleId={circle.id!} router={router} starIds={userStars[eventId].circleStars} />
      <CircleDetail circle={circle} books={books} editable={false} />
    </>
  )
}

CirclePage.getInitialProps = async context => {
  initFirebase()
  const id = context.query.id as string
  if (!id) {
    // TODO: リダイレクトの処理
  }
  const db: firebase.firestore.Firestore = firebase.firestore()
  const circleRef = db.collection('circles').doc(id)
  const circle = await circleRef.get()
  const snapshots = await db
    .collection('books')
    .where('circleRef', '==', circleRef)
    .orderBy('order', 'asc')
    .get()
  let books: Book[] = []
  snapshots.forEach(book => {
    const data = book.data() as Book
    books.push(refToId(data))
  })

  return {
    circle: {
      id: circle.id,
      ...circle.data()
    } as Circle,
    books
  }
}

export default withRouter(CirclePage)
